//global varaibles
let uploadedText = "";
const getQuizLink = "https://querai-dv6ggvjzva-nw.a.run.app/get-quiz"
const waekUpAPI = "https://querai-dv6ggvjzva-nw.a.run.app/"

const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs')


const app = express();
const port = process.env.PORT || 8080;

// sendFile will go here
app.use(fileUpload({
  createParentPath: true
}));

app.use(bodyParser.urlencoded({extended: true}));

app.use('/', express.static(path.join(__dirname, '../website')))

app.post('/api/upload', function(req, res) {
  try {
    if(!req.files) {
        res.send({
            status: false,
            message: 'No file uploaded'
        });
    } else {
        let arquivo = req.files.myFile;
        
        //Use the mv() method to place the file in upload directory (i.e. "uploads")
        arquivo.mv('./uploads/' + arquivo.name);
        //send response
        let content = arquivo.data.toString()
        getQuiz(content)
        res.redirect('/upload_success.html');
    }
} catch (err) {
  res.redirect('/upload_error.html');
}
});


//send request to get quiz

app.post('/create-quiz',)

async function getQuiz(context){

  response = await axios.post(getQuizLink, {
    context : context
  })
  fs.writeFileSync('../website/quiz.json', JSON.stringify(response.data));
}

app.listen(port);
console.log('Server started at http://localhost:' + port);