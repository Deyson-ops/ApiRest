const express = require ("express")
const cors = require ("cors")
const app = express ()
let usuarios = ["Marcos","Sergio","Norman"]
app.use(cors())
app.use(express.json())
app.get("/",function(request,response){
    response.status(200).json(usuarios)
})
app.post("/user",function(request,response){
    response.status(200).json(usuarios)
})
app.listen(3000)