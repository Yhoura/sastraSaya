export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p className="footer-brand">Sastra Saya</p>
        <p className="footer-text">Tempat di mana kata-kata menemukan rumahnya.</p>
        <p className="footer-copyright">&copy; {new Date().getFullYear()} Sastra Saya. Hak cipta dilindungi.</p>
      </div>
    </footer>
  );
}
