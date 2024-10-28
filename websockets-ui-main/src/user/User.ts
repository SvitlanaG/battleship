export class User {
  public readonly id: number;
  public name: string;
  public password: string;

  constructor(name: string, password: string, id: number) {
    this.name = name;
    this.password = password;
    this.id = id;
  }
}
