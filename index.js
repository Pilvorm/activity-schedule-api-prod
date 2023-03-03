
const express = require("express");
const app = express();
const PORT = 3001;

const fs = require("fs");
const path = require("path");
const pathToFile = path.resolve("./data.json");
const cors = require("cors")

var corsOptions = {
    origin: 'http://localhost:3000',
    optionSuccessStatus: 200
}

app.use(cors(corsOptions));

const getResources = () => JSON.parse(fs.readFileSync(pathToFile))

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World")
})

// Activity Details
app.get("/api/resources/:id", (req, res) => {
    const resources = getResources()
    const { id } = req.params;
    const resource = resources.find(resource => resource.id === id)
    res.send(resource)
})

// Updating and activating
app.patch("/api/resources/:id", (req, res) => {
    const resources = getResources()
    const { id } = req.params;
    const index = resources.findIndex(resource => resource.id === id)
    const activeActivity = resources.find(resource => resource.status === "active")

    if(resources[index].status === "complete") {
        return res.status(422).send("Cannot update becauase activity has been completed")
    }

    resources[index] = req.body

    //active resource related functionality
    if(req.body.status === "active") {
        if(activeActivity) {
            return res.status(422).send("You already have an active schedule")
        }

        resources[index].status = "active";
        resources[index].activationTime = new Date();
    }

    fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
        if (error) {
            return res.status(422).send("Cannot store data in the file!")
        }

        return res.send("Data has been updated!")
    }) // 2 -> indent
})

// Getting active activities
app.get("/api/activeresource", (req, res) => {
    const resources = getResources();
    const activeResource = resources.find(resource => resource.status === "active");
    res.send(activeResource);
})

// Show activities
app.get("/api/resources", (req, res) => {
    const resources = getResources();
    res.send(resources);
})

// Create new activity
app.post("/api/resources", (req, res) => {
    const resources = getResources()
    const resource = req.body

    resource.createdAt = new Date()
    resource.status = "inactive"
    resource.id = Date.now().toString()
    resources.unshift(resource)

    fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
        if (error) {
            return res.status(422).send("Cannot store data in the file!")
        }

        return res.send("Data has been saved!")
    }) // 2 -> indent
})

app.listen(PORT, () => {
    console.log("Server is listening on port: " + PORT);
})