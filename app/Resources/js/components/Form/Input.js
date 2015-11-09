const InputBase = ReactBootstrap.InputBase;

export default class Input extends InputBase {

  constructor(props) {
    super(props);
  }

  renderChildren() {
    return !this.isCheckboxOrRadio()
      ? [
        this.renderLabel(),
        this.renderHelp(),
        this.renderWrapper([
          this.renderInputGroup(
            this.renderInput()
          ),
          this.renderIcon(),
        ]),
      ]
      : this.renderWrapper([
        this.renderCheckboxAndRadioWrapper(
          this.renderLabel(
            this.renderInput()
          )
        ),
        this.renderHelp(),
      ])
      ;
  }

}
