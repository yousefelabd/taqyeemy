async function check() {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AQ.Ab8RN6K2jdTHz3CF2PX6w4a57h7sZ9BEJGOiPCQNwgdPs_QHJA');
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
check();
