//global varaibles
const getQuizLink = "https://querai-dv6ggvjzva-nw.a.run.app/get-quiz"
//const getQuizLink = "http://localhost:/5000"
const waekUpAPI = "https://querai-dv6ggvjzva-nw.a.run.app/"


const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
let { response } = require('express');
const app = express();
const port = process.env.PORT || 8080;
const cors = require('cors');
const timeout = require('connect-timeout')

//app.use(cors,)

// sendFile will go here
app.use(fileUpload({
  createParentPath: true
}));

app.use(timeout('120s'))

app.use(bodyParser.urlencoded({extended: true}));

app.use('/', express.static(path.join(__dirname, './webapp')))

app.post('/api/upload/', timeout('120s'), function(req, res) {
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
        
        console.log("document uploaded successfully")

        const edit_quiz = getQuiz(content)
        edit_quiz.then( event => {
          res.redirect('/quiz.html');
        })
        
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

  fs.writeFileSync('./webapp/quiz.json', JSON.stringify(response.data));
}

app.listen(port);
console.log('Server started at http://localhost:' + port);