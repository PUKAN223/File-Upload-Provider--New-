const express = require("express")
const path = require('path');
const app = express()
const dotenv = require("dotenv")
const multer = require("multer")
const fs = require("fs")
const { v1: uuidv1, v4: uuidv4, } = require('uuid');

const port = process.env.PORT || 8000
const Url = `http://localhost:${port}`
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        let rpath = randomStr(10)
        fs.mkdirSync(path.join(__dirname, 'uploads/' + rpath))
        callback(null, __dirname + `/uploads/${rpath}`)
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname)
    }
})
const upload = multer({ storage: storage })
app.use(express.static(path.join(__dirname, 'uploads')))
app.use(express.static(path.join(__dirname, 'public')))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})
app.get("/path/:last", (req, res) => {
    fs.readFile("./data/files.json", (err, data) => {
        let fileData = JSON.parse(data.toString())
        fileData.forEach(dt => {
            if (dt.id == req.params.last) {
                res.download(path.join(__dirname, `uploads/${dt.path.split("\\")[2]}`, dt.filename), dt.filename, (err) => {
                    if (err) {
                        res.status(500).write('Error downloading file');
                        res.end()
                    }
                })
            }
        })
    })
})
app.post("/upload/:last", upload.single("files"), (req, res) => {
    fs.readFile("./data/files.json", (err, data) => {
        let fileData = JSON.parse(data.toString())
        let continues = true;
        fileData.forEach(dt => {
            if (dt.id == req.params.last) {
                return continues = false
            }
        });
        if (continues == true) {
            let setData = {
                filename: req.file.filename,
                id: req.params.last,
                path: req.file.path.replace(__dirname, "").replace("undefiled", "")
            }
            fileData.push(setData)
            fs.writeFileSync("./data/files.json", JSON.stringify(fileData))
            console.log(req.file.path)
        } else if (continues == false) {
            console.log("File already have!: " + req.file.filename)
        }
    })
})
app.listen(8000, () => {
    console.log(`App running on ${Url}`)
})

function randomStr(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}