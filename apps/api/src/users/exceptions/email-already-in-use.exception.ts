export class EmailAlreadyInUseException extends Error {
  constructor(public readonly email: string) {
    super(`O e-mail ${email} já está em uso por outro usuário.`);
    this.name = 'EmailAlreadyInUseException';
  }
}
