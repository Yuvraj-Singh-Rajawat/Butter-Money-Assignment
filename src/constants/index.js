const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const FILE_UPLOAD_DIR_ON_SERVER = "public/uploads";
// Allow xls, xlsx and csv
const ALLOWED_FILE_TYPE = /(xls|xlsx|csv)$/i;

export { MAX_FILE_SIZE, FILE_UPLOAD_DIR_ON_SERVER, ALLOWED_FILE_TYPE };
