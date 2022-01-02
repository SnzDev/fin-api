const express = require('express');
const { v4: uuidv4 } = require('uuid')

const app = express();
app.use(express.json());

const customers = [];

//MIDDLEWARES
function verifyIfCustomerExists(request, response, next) {
    const { cpf } = request.headers;

    const customer = customers.find(customer => customer.cpf === cpf);

    if (!customer) {
        return response.status(400).json({ error: 'Customer not found' });
    }
    request.customer = customer;

    return next();
}

app.post('/account', (request, response) => {
    const { cpf, name } = request.body;
    const id = uuidv4();

    const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf);
    if (customerAlreadyExists) {
        return response.status(400).json({ error: "Custumer already exists!" })
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    })
    return response.status(201).send();
});

app.get("/statement", verifyIfCustomerExists, (request, response) => {
    const { customer } = request;

    return response.json(customer.statement);
});

app.post("/deposit", verifyIfCustomerExists, (request, response) => {
    const { description, amount } = request.body;
    const { customer } = request;

    const statementOperation = {
        description,
        amount,
        date: new Date(),
        operation: "credit",
    };

    customer.statement.push(statementOperation);

    return response.status(201).send()
})

app.listen(3333);