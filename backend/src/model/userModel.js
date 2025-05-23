const db = require("../../config/db");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

class User {
    constructor({ ID, Username, Pass, Fullname, Dob, Email, Tel}) {
        this.ID = ID;
        this.Username = Username;
        this.Pass = Pass;
        this.Fullname = Fullname;
        this.Dob = Dob;
        this.Email = Email;
        this.Tel = Tel;
    }

    static async findById(id) {
        const [results] = await db.promise().query("SELECT * FROM User WHERE ID = ?", [id]);
        if (results.length === 0) return null;
        return new User(results[0]);
    }

    static async exists(id) {
        const [results] = await db.promise().query("SELECT * FROM User WHERE ID = ?", [id]);
        return results.length > 0;
    }

    static async updatePassword(id, newPassword) {
        const hashed = bcrypt.hashSync(newPassword, SALT_ROUNDS);
        await db.promise().query("UPDATE User SET Pass = ? WHERE ID = ?", [hashed, id]);
    }

    async save() {
        await db.promise().query(
            "UPDATE User SET Fullname = ?, Dob = ?, Email = ?, Tel = ? WHERE ID = ?",
            [this.Fullname, this.Dob, this.Email, this.Tel, this.ID]
        );
    }

    async comparePassword(inputPassword) {
        return bcrypt.compare(inputPassword, this.Pass);
    }
}

module.exports = User;
