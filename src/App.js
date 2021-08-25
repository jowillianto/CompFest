import React from 'react'
import axios from 'axios'
import './index.css'

function oauthSignIn(id, redirect) {
  // Google's OAuth 2.0 endpoint for requesting an access token
  var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

  // Create <form> element to submit parameters to OAuth 2.0 endpoint.
  var form = document.createElement('form');
  form.setAttribute('method', 'GET'); // Send as a GET request.
  form.setAttribute('action', oauth2Endpoint);

  // Parameters to pass to OAuth 2.0 endpoint.
  var params = {client_id: id,
                redirect_uri: redirect,
                response_type: 'token',
                scope: 'https://www.googleapis.com/auth/cloud-platform',
                include_granted_scopes: 'true',
                state: 'pass-through value'};

  // Add form parameters as hidden input values.
  for (var p in params) {
    var input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', p);
    input.setAttribute('value', params[p]);
    form.appendChild(input);
  }

  // Add form to page and submit it to open the OAuth 2.0 endpoint.
  document.body.appendChild(form);
  form.submit();
}

export default class App extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      fileForm : {
        name  : "Upload gambar untuk dideteksi",
        type  : "file",
        value : null
      },
      warn     : "",
      result   : "",
      data     : null
    }
    this.page       = 'https://realtimefeedback.netlify.app'
    this.oAuth      = {
      web:{
        client_id :"678299522458-1pgpvioufekpgpe2nt0ou6j90949u1ch.apps.googleusercontent.com",
        project_id:"emotion-detection-323819",
        auth_uri:"https://accounts.google.com/o/oauth2/auth",
        token_uri:"https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:"https://www.googleapis.com/oauth2/v1/certs",
        client_secret:"ChXeispm2Pvuy9HuPOe9jOID"
      }
    }
    this.token      = window.location.href !== `${this.page}/` ? window.location.href.split('&')[1].split('=')[1] : ""
    this.project_id = "678299522458"
    this.end_id     = "5120152971669143552"
    this.apiKey     = "AIzaSyANjzxDu0GEUoPtPdwOttomqXfFwIpukGQ"
    this.url        = `https://us-central1-aiplatform.googleapis.com/v1/projects/${this.project_id}/locations/us-central1/endpoints/${this.end_id}:predict  `

  }
  handleFileInput = (event) => {
    const form = Object.assign(this.state.fileForm, {
      value : event.target.files[0]
    })
    this.setState({fileForm : form, warn : ""})
  }
  removeFileInput = () => {
    const form = Object.assign(this.state.fileForm, {
      value : null
    })
    this.setState({fileForm : form, warn : ""})
  }
  uploadFileInput = () => {
    if(this.state.fileForm.value == null) this.setState({warn : "Pilih File !"})
    else if(this.token === "") this.setState({warn : "Anda harus authenticate terlebih dahulu"})
    else{
      const reader   = new FileReader()
      reader.readAsDataURL(this.state.fileForm.value)
      reader.addEventListener('load', () => this.pushFileToCloud(reader.result.split(',')[1]))
    }
  }
  pushFileToCloud(file){
    const reqForm   = {
      instances : [{
        content: file
      }],
      parameters : {
        confidenceThreshold : 0,
        maxPredictions  : 100
      }
    }
    const header  = {
      headers : {
        Authorization : `Bearer ${this.token}`
      }
    }
    axios.post(this.url, reqForm, header).then((resp) => {
      console.log(resp.data)
      this.setState({data : resp.data.predictions[0]})
    }).catch((err) => {
      console.log(err.response)
    })
  }
  authenticate = () => {
   oauthSignIn(this.oAuth.web.client_id, this.page)
  }
  renderTable(){
    if(this.state.data === null) return(<React.Fragment></React.Fragment>)
    else{
      const data = this.state.data.displayNames.map((val, id) => 
        <tr>
          <td>{val}</td>
          <td>{this.state.data.confidences[id]}</td>
        </tr>
      )
      return(
        <table>
          {data}
        </table>
      )
    }
  }
  render(){
    return(
      <main>
        <div className = "file-input">
          <p>{this.state.fileForm.name}</p>
          <input type = {this.state.fileForm.type} onChange = {this.handleFileInput} />
        </div>
        <div className = "file-warn">
          <p>{this.state.warn}</p>
        </div>
        <div className = "file-but">
          <button onClick = {this.authenticate}>Authenticate</button>
          <button onClick = {this.removeFileInput}>Remove File</button>
          <button onClick = {this.uploadFileInput}>Upload File</button>
        </div>
        <div className = "file-res">
          <h3>Hasil AI</h3>
          <p>{this.renderTable()}</p>
        </div>
      </main>
    )
  }
}