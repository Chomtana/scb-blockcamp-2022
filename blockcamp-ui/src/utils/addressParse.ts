export default function addressParse(address: String, length = 4) {
  return (
    address.slice(0, length + 2) +
    '...' +
    address.slice(address.length - length, address.length)
  );
}
