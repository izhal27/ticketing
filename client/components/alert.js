export default function Alert({ errors }) {
  const renderedErrors = errors?.map((e, i) => <li key={i}>{e.message}</li>);

  return (
    <div className="alert alert-danger" role="alert">
      <h4>Ooops...</h4>
      <ul className="my-0">{renderedErrors}</ul>
    </div>
  );
}
