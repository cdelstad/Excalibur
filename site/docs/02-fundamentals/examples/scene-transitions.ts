

class MyScene extends ex.Scene {
  public onInitialize(): void {
    this.add(
      new ex.Actor({
        pos: ex.vec(200, 200),
        color: ex.Color.Red,
        width: 100,
        height: 200
      }))
  }
}


class MyOtherScene extends ex.Scene {
  public onInitialize(): void {
    this.add(
      new ex.Actor({
        pos: ex.vec(200, 200),
        color: ex.Color.Blue,
        width: 200,
        height: 100
      }))
  }
}

game.add('scene1', {
  scene: MyScene,
  transitions: {
    in: new ex.FadeInOut({duration: 500, direction: 'in', color: ex.Color.Black}),
    out: new ex.FadeInOut({duration: 500, direction: 'out', color: ex.Color.Black})
  }
});

game.add('scene2', { 
  scene: MyOtherScene,
  transitions: {
    in: new ex.FadeInOut({duration: 500, direction: 'in', color: ex.Color.Black}),
    out: new ex.FadeInOut({duration: 500, direction: 'out', color: ex.Color.Black})
  }
});

game.input.pointers.primary.on('down', () => {
  game.currentSceneName === 'scene2' ? game.goto('scene1') : game.goto('scene2');
});

game.start('scene2');