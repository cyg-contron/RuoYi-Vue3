export function getFileName(name) {
    if (name && name.lastIndexOf("/") > -1) {
        return name.slice(name.lastIndexOf("/") + 1);
    } else {
        return "";
    }
}
