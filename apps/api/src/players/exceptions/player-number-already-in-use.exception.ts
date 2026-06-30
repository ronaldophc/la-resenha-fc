export class PlayerNumberAlreadyInUseException extends Error {
  constructor(public readonly number: number) {
    super(`O número da camisa ${number} já está em uso por outro jogador.`);
    this.name = 'PlayerNumberAlreadyInUseException';
  }
}
