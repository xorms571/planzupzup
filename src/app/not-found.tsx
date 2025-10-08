export default function NotFound() {
  return (
    <div style={{width:'100%', height:'100%', display:'flex', flexDirection:'column', gap:'8px', justifyContent:'center', alignItems:'center'}}>
      <h1 style={{color:'#111', fontSize:'32px', fontWeight:'bold'}}>페이지를 찾을 수 없어요</h1>
      <p style={{fontSize:'16px', color:'#767676'}}>오류가 발생해 페이지를 표시할 수 없습니다. 잠시 후 다시 시도해 주세요.</p>
    </div>
  );
}