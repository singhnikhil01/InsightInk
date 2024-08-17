import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import User from "./Schema/User.js";
import jwt from "jsonwebtoken";
import cors from "cors";
import admin from "firebase-admin";
import serviceAccountKey from "./yatrablog-2692b-firebase-adminsdk-u96ct-e034027641.json" assert { type: "json" };
import { getAuth } from "firebase-admin/auth";
import aws from "aws-sdk";
import Blog from "./Schema/Blog.js";
import Comment from "./Schema/Comment.js"
import Notification from "./Schema/Notification.js";

const server = express();
const PORT = process.env.PORT || 3000;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
});

server.use(express.json());
server.use(cors());

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true,
});


const s3 = new aws.S3({
    region: "ap-south-1",
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const generateUploadURL = async () => {
    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;
    return await s3.getSignedUrlPromise("putObject", {
        Bucket: "yatrablog",
        Key: imageName,
        ContentType: "image/jpeg",
    });
};

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
        return res.status(401).json({ error: "No access token" });
    }

    jwt.verify(token, process.env.SECRECT_ACCESS_KEY, (err, user) => {
        if (err) {
            return res.status(500).json({ error: "Failed to authenticate token" });
        }
        req.user = user.id;
        next();
    });
};

const formatDatatoSend = (user) => {
    const access_token = jwt.sign(
        { id: user._id },
        process.env.SECRECT_ACCESS_KEY,
        { expiresIn: '7d' }

    );
    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname,
    };
};

const generateUsername = async (email) => {
    let username = email.split("@")[0];
    let isUsernameNotUnique = await User.exists({
        "personal_info.username": username,
    });
    if (isUsernameNotUnique) {
        username += nanoid().substring(0, 5);
    }
    return username;
};

//upload image url route
server.get("/get-upload-url", (req, res) => {
    generateUploadURL()
        .then((url) => res.status(200).json({ uploadUrl: url }))
        .catch((err) => {
            return res.status(500).json({ error: err.message });
        });
});

server.post('/latest-blogs', (req, res) => {
    const maxlimit = 5;
    let { page } = req.body

    Blog.find({ draft: false })
        .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img -_id")
        .sort({ "publishedAt": -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxlimit)
        .limit(maxlimit)
        .then(blogs => res.status(200).json({ blogs }))
        .catch(err => res.status(500).json({ error: `Error fetching latest blogs: ${err.message}` }));
});

server.get('/trending-blogs', (req, res) => {
    const maxlimit = 5;

    Blog.find({ draft: false })
        .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img -_id")
        .sort({ "activity.total_reads": -1, "activity.total_likes": -1, "publishedAt": -1 })
        .select("blog_id title publishedAt -_id")
        .limit(maxlimit)
        .then(blogs => res.status(200).json({ blogs }))
        .catch(err => res.status(500).json({ error: `Error fetching trending blogs: ${err.message}` }));
});


server.post("/all-latest-blogs-count", (req, res) => {
    Blog.countDocuments({ draft: false }).then((count) => {
        return res.status(200).json({ totalDocs: count })
    }).catch(err => {
        return res.status(500).json({ err: err.message })
    })
})

server.post("/get-profile", (req, res) => {
    let { username } = req.body
    User.findOne({ "personal_info.username": username })
        .select("-personal_info.password -google_auth -updatedAt -blogs")
        .then(user => {
            return res.status(200).json(user)
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({ error: err.message })
        })
})

server.post("/signup", (req, res) => {
    let { fullname, email, password } = req.body;
    if (fullname.length < 3) {
        return res
            .status(403)
            .json({ error: "Full name must be at least 3 letters long" });
    }

    if (!email.length) {
        return res.status(403).json({ error: "Enter Email" });
    }
    if (!emailRegex.test(email)) {
        return res.status(403).json({ error: "Email is invalid" });
    }

    if (!passwordRegex.test(password)) {
        return res.status(403).json({
            error:
                "Password should be 6 to 20 characters long with a numeric, lowercase and uppercase letters",
        });
    }

    bcrypt.hash(password, 10, async (error, hashed_password) => {
        if (error) {
            return res.status(500).json({ error: "Error hashing password" });
        }
        let username = await generateUsername(email);

        let user = new User({
            personal_info: { fullname, email, password: hashed_password, username },
        });

        user
            .save()
            .then((u) => {
                return res.status(200).json(formatDatatoSend(u));
            })
            .catch((err) => {
                if (err.code == 11000) {
                    return res.status(500).json({ error: "Email already exists" });
                }
                return res.status(500).json({ error: err.message });
            });
    });
});

server.post("/signin", (req, res) => {
    let { email, password } = req.body;
    User.findOne({ "personal_info.email": email })
        .then((user) => {
            if (!user) {
                return res.status(403).json({ error: "Incorrect Email/Password " });
            }
            if (!user.personal_info.password) {
                return res.status(403).json({ error: "Incorrect Email/Password " });
            }
            bcrypt.compare(password, user.personal_info.password, (err, result) => {
                if (err) {
                    return res
                        .status(403)
                        .json({
                            error: "Error occurred while logging in. Please try again",
                        });
                }

                if (!result) {
                    return res.status(403).json({ error: "Incorrect Email/Password" });
                } else {
                    return res.status(200).json(formatDatatoSend(user));
                }
            });
        })
        .catch((err) => {
            return res.status(403).json({ error: err.message });
        });
});

server.post("/google-auth", async (req, res) => {
    let { access_token } = req.body;

    try {
        const decodedUser = await getAuth().verifyIdToken(access_token);
        let { email, name, picture } = decodedUser;
        picture = picture.replace("s96-c", "s384-c");

        let user = await User.findOne({ "personal_info.email": email }).select(
            "personal_info.fullname personal_info.profile_img google_auth personal_info.username"
        );

        if (user) {
            if (!user.google_auth) {
                return res
                    .status(403)
                    .json({
                        error:
                            "The email was signed up without Google. Please log in with a password to access the account.",
                    });
            }
            return res.status(200).json(formatDatatoSend(user));
        } else {
            let username = await generateUsername(email);
            user = new User({
                personal_info: {
                    fullname: name,
                    email,
                    password: null,
                    profile_img: picture,
                    username: username,
                },
                google_auth: true,
            });

            await user.save();
            return res.status(200).json(formatDatatoSend(user));
        }
    } catch (err) {
        return res
            .status(500)
            .json({
                error:
                    "Failed to authenticate with Google. Please try again with a different Google account.",
            });
    }
});

server.post("/search-users", (req, res) => {
    let { query } = req.body;
    User.find({ "personal_info.username": new RegExp(query, 'i') })
        .limit(50)
        .select("personal_info.fullname personal_info.username personal_info.profile_img  -_id")
        .then
        (users => {
            return res.status(200).json({ users })
        }
        ).catch(err => {
            return res.status(500).json({ err: err.message })
        })
})

server.post("/get-blog", (req, res) => {
    let { blog_id, draft, mode } = req.body;
    let incrementVal = mode != 'edit' ? 1 : 0;
    Blog.findOneAndUpdate({ blog_id, draft: false }, { $inc: { "activity.total_reads": incrementVal } })
        .populate("author", "personal_info.username personal_info.fullname personal_info.profile_img")
        .select("title des content banner activity publishedAt blog_id tags")
        .then(blog => {
            User.findOneAndUpdate({ "_id": blog.author }, { $inc: { "account_info.total_reads": incrementVal } }).catch(err => {
                return res.status(500).json({ error: err.message })
            })
            if (Blog.draft && !draft) {
                return res.status(404).json({ error: "You cannot access draft Blog" })
            }
            return res.status(200).json({ blog })
        }).catch(err => {
            return res.status(500).json({ error: err.message })
        })

})

server.post("/search-blogs", (req, res) => {
    let { tag, query, author, page, limit, eliminate_blogs } = req.body
    let findQuery;
    let maxlimit = limit ? limit : 5;



    if (tag) {
        findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blogs } };
    } else if (query) {
        findQuery = { draft: false, title: new RegExp(query, 'i') }
    }
    else if (author) {
        findQuery = { author, draft: false }

    }

    Blog.find(findQuery)
        .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img -_id")
        .sort({ "publishedAt": -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxlimit)
        .limit(maxlimit)
        .then(blogs => {
            res.status(200).json({ blogs })
        })
        .catch(err => res.status(500).json({ error: `Error fetching trending blogs: ${err.message}` }));

})


server.post("/search-blogs-count", (req, res) => {
    let { tag, query, author } = req.body;
    let findQuery;
    if (tag) {
        findQuery = { tags: tag, draft: false };
    } else if (query) {
        findQuery = { draft: false, title: new RegExp(query, 'i') }
    } else if (author) {
        findQuery = { author, draft: false }
    }

    Blog.countDocuments(findQuery).then(count => {
        return res.status(200).json({ totalDocs: count })

    }).catch(err => {
        console.log(err.message)
        return res.status(500).json({ err: err.message })
    })
})

server.post("/create-blog", verifyJWT, (req, res) => {
    const authorId = req.user;
    const { title, des, banner, tags, content, draft, id } = req.body;

    if (!title || title.length === 0) {
        return res.status(403).json({ error: "You must provide a title" });
    }

    if (!draft) {
        if (!des || des.length === 0 || des.length > 200) {
            return res.status(403).json({ error: "You must provide a blog description under 200 characters" });
        }
        if (!banner || banner.length === 0) {
            return res.status(403).json({ error: "You must provide a blog banner to publish" });
        }
        if (!content || !content.blocks || content.blocks.length === 0) {
            return res.status(403).json({ error: "There must be blog content to publish" });
        }
        if (!tags || tags.length === 0 || tags.length > 10) {
            return res.status(403).json({ error: "You must provide tags, with a maximum of 10" });
        }
    }

    const normalizedTags = tags.map(tag => tag.toLowerCase());
    const blogId = id || title
        .replace(/[^a-zA-Z0-9]/g, " ")
        .replace(/\s+/g, "-")
        .trim() + nanoid();

    // Create or update blog
    const blogData = {
        title,
        des,
        banner,
        content,
        tags: normalizedTags,
        author: authorId,
        blog_id: blogId,
        draft: Boolean(draft),
    };

    if (id) {
        Blog.findOneAndUpdate({ blog_id: id }, blogData)
            .then(updatedBlog => {
                if (!updatedBlog) {
                    return res.status(404).json({ error: "Blog not found" });
                }
                res.status(200).json({ id: blogId });
            })
            .catch(err => res.status(500).json({ error: err.message }));
    } else {
        const newBlog = new Blog(blogData);
        newBlog.save()
            .then(blog => {
                const incrementVal = draft ? 0 : 1;
                User.findOneAndUpdate(
                    { _id: authorId },
                    {
                        $inc: { "account_info.total_posts": incrementVal },
                        $push: { blogs: blog._id },
                    }
                )
                    .then(() => res.status(200).json({ id: blog.blog_id }))
                    .catch(err => res.status(500).json({ error: "Failed to update total posts number" }));
            })
            .catch(err => res.status(500).json({ error: err.message }));
    }
});


server.post('/like-blog', verifyJWT, async (req, res) => {
    try {
        let user_id = req.user;
        let { _id, isLikedByUser } = req.body;
        let incrementVal = isLikedByUser ? 1 : -1;

        let blog = await Blog.findOneAndUpdate(
            { _id },
            { $inc: { "activity.total_likes": incrementVal } },
            { new: true }
        );

        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        if (isLikedByUser) {
            let like = new Notification({
                type: "like",
                blog: _id,
                notification_for: blog.author,
                user: user_id
            });

            await like.save();
            return res.status(200).json({ liked_by_user: true });
        } else {
            await Notification.findOneAndDelete({ user: user_id, blog: _id, type: "like" });
            return res.status(200).json({ liked_by_user: false });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});


server.post("/isliked-by-user", verifyJWT, (req, res) => {
    let user_id = req.user;
    let { _id } = req.body;

    Notification.exists({ user: user_id, type: "like", blog: _id })
        .then(result => {
            return res.status(200).json({ result });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        });
});


server.post("/add-comment", verifyJWT, async (req, res) => {
    try {
        const user_id = req.user;
        const { _id, comment, blog_author, replying_to } = req.body;
        const isReply = !!replying_to;  // Simplify boolean conversion

        if (!comment || !comment.trim()) {
            return res.status(403).json({ error: "Write something to comment" });
        }

        const commentObj = {
            blog_id: _id,
            blog_author,
            comment,
            isReply,
            commented_by: user_id,
            parent: replying_to || undefined,  // Set parent only if replying_to is provided
        };

        const commentFile = await new Comment(commentObj).save();
        const { comment: savedComment, commentedAt, children } = commentFile;

        await Blog.findOneAndUpdate(
            { _id },
            {
                $push: { comments: commentFile._id },
                $inc: {
                    "activity.total_comments": 1,
                    "activity.total_parent_comments": isReply ? 0 : 1,
                },
            }
        );

        const notificationObj = {
            type: isReply ? "reply" : "comment",
            blog: _id,
            notification_for: blog_author,
            user: user_id,
            comment: commentFile._id,
        };

        if (isReply) {
            notificationObj.replied_on_comment = replying_to;
            const parentComment = await Comment.findByIdAndUpdate(
                replying_to,
                { $push: { children: commentFile._id } },
                { new: true }
            );

            if (parentComment) {
                notificationObj.notification_for = parentComment.commented_by;
            }
        }

        await new Notification(notificationObj).save();

        return res.status(200).json({ comment: savedComment, commentedAt, _id: commentFile._id, user_id, children });
    } catch (err) {
        console.error("Error processing comment:", err);
        return res.status(500).json({ error: "Error processing comment" });
    }
});


server.post("/get-blog-comments", (req, res) => {
    const { blog_id, skip = 0 } = req.body;
    const limit = 5;
    Comment.find({ blog_id, isReply: false })
        .populate("commented_by", "personal_info.username personal_info.fullname personal_info.profile_img")
        .skip(skip)
        .limit(limit)
        .sort({ commentedAt: -1 })
        .then(comments => res.status(200).json(comments))
        .catch(err => {
            console.error("Error fetching comments:", err);
            return res.status(500).json({ error: err.message });
        });
});

server.post('/get-replies', (req, res) => {
    let { _id, skip } = req.body;
    let maxlimit = 5;

    Comment.findOne({ _id })
        .populate({
            path: "children",
            options: {
                limit: maxlimit,
                skip: skip,
                sort: { 'commentedAt': -1 }
            },
            populate: {
                path: "commented_by",
                select: "personal_info.profile_img personal_info.fullname personal_info.username"
            },
            select: "-blog_id -updatedAt"
        })
        .select("children")
        .then(doc => {
            return res.status(200).json({ replies: doc.children });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        });
});

const deleteComments = (_id) => {
    Comment.findOne({ _id })
        .then(comment => {
            if (comment && comment.parent) {
                return Comment.findOneAndUpdate(
                    { _id: comment.parent },
                    { $pull: { children: _id } }
                );
            }
        })
        .then(() => Comment.deleteOne({ _id }))
        .then(() => {
            Notification.deleteOne({ comment: _id }).then(() => {
                console.log("Comment notification deleted");
            });
            Notification.deleteOne({ reply: _id }).then(() => {
                console.log("Reply notification deleted");
            });
        })
        .catch(err => {
            console.error('Error deleting comment:', err);
        });

    // Update the blog and handle nested comment deletions without awaiting
    Comment.findOne({ _id })
        .then(comment => {
            if (comment) {
                Blog.findOneAndUpdate(
                    { _id: comment.blog_id },
                    {
                        $pull: { comments: _id },
                        $inc: {
                            "activity.total_comments": -1,
                            "activity.total_parent_comments": comment.parent ? 0 : -1
                        }
                    }
                ).catch(err => {
                    console.error('Error updating blog:', err);
                });

                // Recursively delete child comments
                if (comment.children.length) {
                    comment.children.forEach(replyId => {
                        deleteComments(replyId);
                    });
                }
            }
        })
        .catch(err => {
            console.error('Error finding comment:', err);
        });
};

server.post("/delete-comment", verifyJWT, (req, res) => {
    const user_id = req.user;
    const { _id } = req.body;

    Comment.findOne({ _id })
        .then(comment => {
            if (!comment) {
                return res.status(404).json({ error: "Comment not found" });
            }

            if (user_id == comment.commented_by || user_id == comment.blog.author) {
                deleteComments(_id);
                return res.status(200).json({ status: 'done' });
            } else {
                return res.status(401).json({ error: "You are not authorized to delete this comment" });
            }
        })
        .catch(err => {
            console.error('Error processing delete comment request:', err);
            return res.status(500).json({ error: "Internal server error" });
        });
});



server.listen(PORT, '0.0.0.0', () => {
    console.log("Listening on port -> " + PORT);
});
