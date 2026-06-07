const mongoose = require("mongoose");
const Person = require("./models/person");

if (process.argv.length < 3) {
  console.log("give password as argument.");
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3] || null;
const number = process.argv[4] || null;

const db_url = `mongodb+srv://fullstack:${password}@cluster0.mdwgvtm.mongodb.net/?appName=Cluster0`;

const registerPerson = async () => {
  if (name && number) {
    const personEntry = new Person({
      name,
      number,
    });
    await personEntry.save();
    console.log(`added ${name} number ${number} to phonebook`);
  } else if (!name || !number) {
    console.log("name or phone number is missing");
  }
};

const showPersons = async () => {
  const persons = await Person.find({});
  console.log("phonebook: ");
  persons.forEach((person) => console.log(`${person.name} ${person.number}`));
};

const main = async () => {
  try {
    await mongoose.connect(db_url);
    if (!name && !number) {
      await showPersons();
    } else {
      await registerPerson();
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

main();
