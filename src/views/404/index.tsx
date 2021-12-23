import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <>
      <h1 style={{ textAlign: 'center' }} onClick={() => navigate(-1)}>
        404 Page NotFound
      </h1>
    </>
  )
}
