<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminProjectTrait
{
    /**
     * @When I click the project add button
     */
    public function iClickAddProjectButton()
    {
        $this->getCurrentPage()->clickAddButton();
    }

    /**
     * @When I submit the project add modal
     */
    public function iSubmitProjectModal()
    {
        $this->getCurrentPage()->submitModal();
    }

    /**
     * @When I fill the authors field
     */
    public function iFillAuthorsField()
    {
        $node = $this->getCurrentPage()
        ->find('css', '#project-author .react-select__input input');
        
        $node->setValue('admin');
        $node->keyPress(13);
        
        $this->getSession()->wait(10);
    }
}
