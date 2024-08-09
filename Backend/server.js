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
        process.env.SECRECT_ACCESS_KEY
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

server.post("/search-blogs", (req, res) => {
    let { tag, query, author, page } = req.body
    let findQuery;
    let maxlimit = 5;

    if (tag) {
        findQuery = { tags: tag, draft: false };
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
        .then(blogs => res.status(200).json({ blogs }))
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
    let authorId = req.user;
    let { title, des, banner, tags, content, draft } = req.body;

    if (!title.length) {
        return res.status(403).json({ error: "you must provide title" });
    }

    if (!draft) {
        if (!des.length || des.length > 200) {
            return res
                .status(403)
                .json({
                    error: "you must provide Blog description under 200 characters",
                });
        }
        if (!banner.length) {
            return res
                .status(403)
                .json({ error: "you must provide blog Banner to publish" });
        }

        if (!content.blocks.length) {
            return res
                .status(403)
                .json({ error: "There must be blog content to publish" });
        }

        if (!tags.length || tags.length > 10) {
            return res
                .status(403)
                .json({ error: "Must provide tags , Maximum of 10" });
        }
    }

    tags = tags.map((tag) => tag.toLowerCase());
    let blog_id =
        title
            .replace(/[^a-zA-Z0-9]/g, " ")
            .replace(/\s+/g, "-")
            .trim() + nanoid();

    let blog = new Blog({
        title,
        des,
        banner,
        content,
        tags,
        author: authorId,
        blog_id,
        draft: Boolean(draft),
    });

    blog
        .save()
        .then((blog) => {
            let incrementVal = draft ? 0 : 1;
            User.findOneAndUpdate(
                { _id: authorId },
                {
                    $inc: { "account_info.total_posts": incrementVal },
                    $push: {
                        blogs: blog._id,
                    },
                }
            )
                .then((user) => {
                    return res.status(200).json({ id: blog.blog_id });
                })
                .catch((err) => {
                    return res
                        .status(500)
                        .json({ error: "Failed to update total posts number" });
                });
        })
        .catch((err) => {
            return res.status(500).json({ error: err.message });
        });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log("Listening on port -> " + PORT);
});
