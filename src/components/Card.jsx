export default function Card({ title, children, actions }){
  return (
    <div className=" rounded-2xl shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <div>{actions}</div>
      </div>
      <div>{children}</div>
    </div>
  )
}
