<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminProjectDistrictTrait
{
    /**
     * @When I click the add button
     */
    public function iClickAddButton()
    {
        $this->getCurrentPage()->clickAddButton();
    }

    /**
     * @When I enable the border checkbox
     */
    public function iEnableBorderCheckbox()
    {
        $this->getCurrentPage()->enableBorderCheckbox();
    }

    /**
     * @When I pick a color
     */
    public function iPickAColor()
    {
        $this->getCurrentPage()->pickAColor();
    }

    /**
     * @When I submit the modal
     */
    public function iSubmitTheModal()
    {
        $this->getCurrentPage()->submitModal();
    }

    /**
     * @When I click the delete button for Deuxième Quartier
     */
    public function iClickDeleteButton()
    {
        $this->getCurrentPage()->clickDeleteButton();
    }

    /**
     * @When I click the confirm delete popover
     */
    public function iClickConfirmDeletePopover()
    {
        $this->getCurrentPage()->clickConfirmDeletePopover();
    }

    /**
     * @When I click the edit button
     */
    public function iClickEditButton()
    {
        $this->getCurrentPage()->clickEditButton();
    }
}
