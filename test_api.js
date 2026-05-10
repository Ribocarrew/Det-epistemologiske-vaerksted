fetch('http://localhost:8080/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Eleverne læser en bog.' })
})
.then(res => res.json().then(data => console.log('STATUS:', res.status, 'BODY:', data)))
.catch(err => console.error(err));
