export class User {
  public readonly id: string;
  public name: string;
  public password: string;

  constructor(name: string, password: string) {
    this.id = this.name = name;
    this.password = password;
  }
}
