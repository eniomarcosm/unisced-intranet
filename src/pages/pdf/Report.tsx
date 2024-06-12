import React from 'react'

const style = {
  container: {
    padding: '20px',
    border: '1px solid black',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9'
  }
}

export const Report = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
  return (
    <div ref={ref} {...props}>
      <div style={style.container}>
        <p style={{ color: 'red' }}>My cool content here!</p>
      </div>
    </div>
  )
})

export default Report
