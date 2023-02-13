import { useEffect, useState } from 'react'
import nameService from './services/names'
import './index.css'

const Notification = ({message, style}) => {
  if (message == null) return null
  if (style == null) return (<div className='notification'>{message}</div>)
  else return (<div style={style}>{message}</div>)
}

const Filter = ({filter, handleFilterChange}) => {
  return (
    <div>
      <p>Filter shown with <input value={filter} onChange={handleFilterChange}/></p>
    </div>
  )
}

const PersonForm = ({onSubmit, newName, newNumber, handleNameChange, handleNumberChange}) => {
  return (
    <div>
      <form onSubmit={onSubmit}>
        <div>
          <p>name: <input value={newName} onChange={handleNameChange}/></p>
          <p>number: <input value={newNumber} onChange={handleNumberChange}/></p>
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
    </div>
  )
}

const Persons = ({shownPersons, deleteAction}) => {
  return (
    <div>
      {shownPersons.map(person => 
        <p key={person.name}>{person.name} {person.number} <button onClick={() => {deleteAction(person)}}>delete</button></p>
      )}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([
    { name: 'Arto Hellas' }
  ]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState(null)
  const [nStyle, setNStyle] = useState(null)

  useEffect(() => {
    nameService
      .getAll()
      .then(newPersons => {
        setPersons(newPersons)
      })
  }, [])

  const addPerson = (event) => {
    event.preventDefault()
    const personObject = {
      name: newName,
      number: newNumber
    }
    for (var i=0; i<persons.length; i++) {
      if (String(persons[i].name).toLowerCase() === String(personObject.name).toLowerCase()) {
        if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
          nameService
            .update(persons[i].id, personObject)
            .then((updatedPerson) => {
              setPersons(persons.map(newPerson => newPerson.name !== updatedPerson.name ? newPerson : updatedPerson))
              setNotification(`Updated ${personObject.name}`)
              setTimeout(() => {setNotification(null)}, 5000)
            })
            .catch(error => {
              console.log(error)
              setNStyle({
                color: 'red',
                background: 'lightgrey',
                fontSize: 20,
                borderStyle: 'solid',
                borderRadius: 5,
                padding: 10,
                marginBottom: 10
              })
              setNotification(`Information of ${personObject.name} has already been removed from server`)
              setTimeout(() => {setNotification(null)}, 5000)
            })
            return
        } else return
      }
    }
    nameService
      .create(personObject)
      .then(newPersons => {
        setPersons(persons.concat(newPersons))
        setNewName('')
        setNewNumber('')
        setNotification(`Added ${personObject.name}`)
        setTimeout(() => {setNotification(null)}, 5000)
      })
  }

  const deletePerson = (person) => {
    if (window.confirm(`Delete ${person.name}?`)) {
      nameService
        .deleteRecord(person.id)
        .then(() => {
          setPersons(persons.filter(newPerson => newPerson.id !== person.id))
        })
    } 
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  var shownPersons = NaN
  if (filter === '') {
    shownPersons = persons
  }
  else {
    shownPersons = persons.filter(person => String(person.name).toLowerCase().startsWith(String(filter).toLowerCase()))
  }

  return (
    <div>
      <h2>Phonebook</h2>
        <Notification message={notification} style={nStyle}/>
        <Filter filter={filter} handleFilterChange={handleFilterChange}/>
      <h2>Add a New Number</h2>
      <PersonForm onSubmit={addPerson} newName={newName} newNumber={newNumber} handleNameChange={handleNameChange} handleNumberChange={handleNumberChange}/>
      <h2>Numbers</h2>
        <Persons shownPersons={shownPersons} deleteAction={deletePerson}/>
    </div>
  )
}

export default App
