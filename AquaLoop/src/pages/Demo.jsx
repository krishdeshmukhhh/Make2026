export default function Demo() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
      }}
    >
      <div
        style={{
          borderRadius: "24px",
          overflow: "hidden",
        }}
      >
        <iframe
          src="https://drive.google.com/file/d/1hYUZsLotBfbCN6ReUxKlOKNm2oHn_ylJ/preview"
          width="1280"
          height="720"
          allow="autoplay"
        />
      </div>
    </div>
  );
}
