export default function Loader({ label = 'Fetching notices…' }) {
  return (
    <div className="loader-wrap">
      <span className="pin-spin" aria-hidden="true" />
      {label}
    </div>
  );
}
