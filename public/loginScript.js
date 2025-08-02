const form = document.querySelector('form')
form.addEventListener('submit', (e)=>{
e.preventDefault()
const formData = new FormData(form)
const name = formData.get('name')
const password = formData.get('password')
console.log(`loginScript formData: ${name}, ${password}`)
const data = new URLSearchParams(formData)
console.log(`loginScript URLSearchParams: ${data}`)
fetch('/users/loginSubmit', {
    method: 'post',
    headers: {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'},
    body: data.toString()
}).then(res => res.text()).then((responseData)=>{
    const div = document.createElement('div')
    div.textContent = responseData
    document.body.appendChild(div)
})
})