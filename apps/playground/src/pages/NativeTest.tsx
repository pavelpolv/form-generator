import React, { useState } from 'react'

export default function NativeTest() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitted:', { firstName, lastName })
  }

  return (
    <div style={{ padding: 24 }}>
      <h3>Нативный тест (без Ant Design)</h3>
      <form onSubmit={onSubmit} style={{ maxWidth: 400 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Имя</label>
          <input
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Введите имя"
            style={{ width: '100%', padding: 8, fontSize: 14 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Фамилия</label>
          <input
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Введите фамилию"
            style={{ width: '100%', padding: 8, fontSize: 14 }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 16px' }}>Отправить</button>
      </form>
    </div>
  )
}
