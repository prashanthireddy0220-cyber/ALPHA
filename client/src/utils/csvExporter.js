export const exportTeamsToCSV = (teamsList, filename = `ALPHA_Teams_Export_${Date.now()}.csv`) => {
  if (!teamsList || teamsList.length === 0) {
    alert('No team registration records available to export.');
    return;
  }

  const headers = [
    'Team ID',
    'Team Name',
    'Member Type',
    'Member Name',
    'Member Registration Number',
    'Member Email',
    'Department',
    'Year',
    'Gender',
    'Hosteller / Day Scholar',
    'Hostel Name',
    'Room Number',
    'Mobile Number',
    'Track',
    'UTR Number',
    'Amount',
    'Payment Status',
    'Submitted At'
  ];

  const rows = [];

  teamsList.forEach((t) => {
    const members = Array.isArray(t.members) && t.members.length > 0 ? t.members : null;
    const teamId = t.teamId || '';
    const teamName = (t.teamName || '').replace(/"/g, '""');
    const track = (t.track || '').replace(/"/g, '""');
    const utr = t.payment?.utr || '';
    const amount = t.payment?.amount !== undefined ? t.payment.amount : 0;
    const status = t.payment?.status || 'PENDING';
    const submittedAt = t.createdAt ? new Date(t.createdAt).toISOString() : '';

    if (members) {
      members.forEach((m, idx) => {
        const isObject = typeof m === 'object' && m !== null;
        const memberType = idx === 0 ? 'Lead' : `Member ${idx + 1}`;
        const name = (isObject ? (m.name || '') : '').replace(/"/g, '""');
        const regNo = isObject ? (m.regNo || '') : '';
        const email = isObject ? (m.email || '') : '';
        const dept = isObject ? (m.department || m.dept || 'CSE') : 'CSE';
        const year = isObject ? (m.year || 'III') : 'III';
        const gender = isObject ? (m.gender || 'N/A') : 'N/A';
        const accom = isObject ? (m.accommodation || 'Day Scholar') : 'Day Scholar';
        const hostel = (isObject ? (m.hostel || 'N/A') : 'N/A').replace(/"/g, '""');
        const room = (isObject ? (m.roomNumber || 'N/A') : 'N/A').replace(/"/g, '""');
        const mobile = isObject ? (m.mobile || 'N/A') : 'N/A';

        rows.push([
          teamId,
          `"${teamName}"`,
          memberType,
          `"${name || teamName}"`,
          regNo || (idx === 0 ? t.leadRegNo : '') || '',
          email || (idx === 0 ? t.leadEmail : '') || '',
          dept,
          year,
          gender,
          accom,
          `"${hostel}"`,
          `"${room}"`,
          mobile,
          `"${track}"`,
          utr,
          amount,
          status,
          submittedAt
        ]);
      });
    } else {
      // Fallback single row for lead if members array is unpopulated
      rows.push([
        teamId,
        `"${teamName}"`,
        'Lead',
        `"${teamName}"`,
        t.leadRegNo || '',
        t.leadEmail || '',
        'CSE',
        'III',
        'N/A',
        'Day Scholar',
        '"N/A"',
        '"N/A"',
        'N/A',
        `"${track}"`,
        utr,
        amount,
        status,
        submittedAt
      ]);
    }
  });

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
