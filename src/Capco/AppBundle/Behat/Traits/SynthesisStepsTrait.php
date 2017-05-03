<?php

namespace Capco\AppBundle\Behat\Traits;

trait SynthesisStepsTrait
{
    protected static $synthesis = [
        'projectSlug' => 'strategie-technologique-de-l-etat-et-services-publics',
        'stepSlug' => 'synthese',
    ];

    /**
     * Go to a synthesis page.
     *
     * @When I go to a synthesis page
     */
    public function iGoToASynthesisPage()
    {
        $this->visitPageWithParams('synthesis page', self::$synthesis);
    }

    /**
     * Go to a synthesis edition page.
     *
     * @When I go to a synthesis edition page
     */
    public function iGoToASynthesisEditionPage()
    {
        $this->visitPageWithParams('synthesis edition page', self::$synthesis);
    }

    /**
     * I should see the synthesis.
     *
     * @Then I should see the synthesis
     */
    public function iShouldSeeTheSynthesis()
    {
        $synthesisSelector = $this->navigationContext->getPage('synthesis page')->getSynthesisViewSelector();
        $this->assertElementOnPage($synthesisSelector);
        $this->assertPageContainsText('Le problème constaté');
        $this->assertPageContainsText('Les causes');
    }

    /**
     * I go to the new inbox.
     *
     * @When I go to the new inbox
     */
    public function iGoToTheNewInbox()
    {
        $this->navigationContext->getPage('synthesis edition page')->goToNewInbox();
        $this->iWait(2);
    }

    /**
     * I should see the new synthesis elements.
     *
     * @Then I should see the new synthesis elements
     */
    public function iShouldSeeTheNewSynthesisElements()
    {
        $elementsSelector = $this->navigationContext->getPage('synthesis edition page')->getElementsSelector();
        $this->assertNumElements(7, $elementsSelector);
    }

    /**
     * I go to the archived inbox.
     *
     * @When I go to the archived inbox
     */
    public function iGoToTheArchivedInbox()
    {
        $this->navigationContext->getPage('synthesis edition page')->goToArchivedInbox();
        $this->iWait(2);
    }

    /**
     * I should see the archived synthesis elements.
     *
     * @Then I should see the archived synthesis elements
     *
     * @param mixed $nb
     */
    public function iShouldSeeTheArchivedSynthesisElements($nb = 15)
    {
        $elementsSelector = $this->navigationContext->getPage('synthesis edition page')->getElementsSelector();
        $this->assertNumElements($nb, $elementsSelector);
    }

    /**
     * I go to the published inbox.
     *
     * @When I go to the published inbox
     */
    public function iGoToThePublishedInbox()
    {
        $this->navigationContext->getPage('synthesis edition page')->goToPublishedInbox();
        $this->iWait(2);
    }

    /**
     * I should see the published synthesis elements.
     *
     * @Then I should see the published synthesis elements
     */
    public function iShouldSeeThePublishedSynthesisElements()
    {
        $elementsSelector = $this->navigationContext->getPage('synthesis edition page')->getElementsSelector();
        $this->assertNumElements(15, $elementsSelector);
    }

    /**
     * I go to the unpublished inbox.
     *
     * @When I go to the unpublished inbox
     */
    public function iGoToTheUnpublishedInbox()
    {
        $this->navigationContext->getPage('synthesis edition page')->goToUnpublishedInbox();
        $this->iWait(2);
    }

    /**
     * I should see the unpublished synthesis elements.
     *
     * @Then I should see the unpublished synthesis elements
     *
     * @param mixed $nb
     */
    public function iShouldSeeTheUnpublishedSynthesisElements($nb = 0)
    {
        $elementsSelector = $this->navigationContext->getPage('synthesis edition page')->getElementsSelector();
        $this->assertNumElements($nb, $elementsSelector);
        if ($nb === 0) {
            $this->assertPageContainsText('Aucun élément.');
        }
    }

    /**
     * I go to the all elements inbox.
     *
     * @When I go to the all elements inbox
     */
    public function iGoToTheAllElementsInbox()
    {
        $this->navigationContext->getPage('synthesis edition page')->goToAllInbox();
        $this->iWait(2);
    }

    /**
     * I should see all the synthesis elements.
     *
     * @Then I should see all the synthesis elements
     */
    public function iShouldSeeAllTheSynthesisElements()
    {
        $elementsSelector = $this->navigationContext->getPage('synthesis edition page')->getElementsSelector();
        $this->assertNumElements(15, $elementsSelector);
    }

    /**
     * I click on a synthesis element.
     *
     * @When I click on a synthesis element
     */
    public function iClickOnASynthesisElement()
    {
        $this->navigationContext->getPage('synthesis edition page')->clickOnElement();
        $this->iWait(2);
    }

    /**
     * I should see the synthesis element details.
     *
     * @Then I should see the synthesis element details
     */
    public function iShouldSeeTheSynthesisElementDetails()
    {
        $this->assertPageContainsText('Contenu de ma super opinion !');
    }

    /**
     * I click the ignore element button.
     *
     * @When I click the ignore element button
     */
    public function iClickTheIgnoreElementButton()
    {
        $this->navigationContext->getPage('synthesis edition page')->ignoreElement();
        $this->iWait(2);
    }

    /**
     * I confirm the ignore element action.
     *
     * @When I confirm the ignore element action
     */
    public function iConfirmTheIgnoreElementAction()
    {
        $this->navigationContext->getPage('synthesis edition page')->confirmIgnoreElement();
        $this->iWait(2);
    }

    /**
     * I should see the synthesis element in the unpublished inbox.
     *
     * @Then I should see the synthesis element in the unpublished inbox
     */
    public function iShouldSeeTheSynthesisElementInTheUnpublishedInbox()
    {
        $this->iGoToTheUnpublishedInbox();
        $this->iShouldSeeTheUnpublishedSynthesisElements(5);
        $this->assertPageContainsText('Opinion 52');
    }

    /**
     * I should see the synthesis element in the archived inbox.
     *
     * @Then I should see the synthesis element in the archived inbox
     */
    public function iShouldSeeTheSynthesisElementInTheArchivedInbox()
    {
        $this->iGoToTheArchivedInbox();
        $this->iShouldSeeTheArchivedSynthesisElements(15);
        $this->assertPageContainsText('Opinion 52');
    }

    /**
     * I click the publish element button.
     *
     * @When I click the publish element button
     */
    public function iClickThePublishElementButton()
    {
        $this->navigationContext->getPage('synthesis edition page')->publishElement();
        $this->iWait(2);
    }

    /**
     * I confirm element publication.
     *
     * @When I confirm element publication
     */
    public function iConfirmElementPublication()
    {
        $this->navigationContext->getPage('synthesis edition page')->confirmPublishElement();
        $this->iWait(2);
    }

    /**
     * I give a note to the synthesis element.
     *
     * @When I give a note to the synthesis element
     */
    public function iGiveANoteToTheSynthesisElement()
    {
        $this->navigationContext->getPage('synthesis edition page')->noteElement();
    }

    /**
     * The synthesis element should have the correct note.
     *
     * @Then the synthesis element should have the correct note
     */
    public function theSynthesisElementShouldHaveTheCorrectNote()
    {
        $this->elementShouldHaveClass('#notation-star-1', 'active');
        $this->elementShouldHaveClass('#notation-star-2', 'active');
        $this->elementShouldHaveClass('#notation-star-3', 'active');
        $this->elementShouldHaveClass('#notation-star-4', 'active');
        $this->elementShouldNotHaveClass('#notation-star-5', 'active');
    }

    /**
     * I choose a parent for the synthesis element.
     *
     * @When I choose a parent for the synthesis element
     */
    public function iChooseAParentForTheSynthesisElement()
    {
        $this->navigationContext->getPage('synthesis edition page')->selectParent();
    }

    /**
     * I add a comment to the synthesis element.
     *
     * @When I add a comment to the synthesis element
     */
    public function iAddACommentToTheSynthesisElement()
    {
        $this->fillField('publish_element_comment', 'Cette contribution est inutile !');
    }

    /**
     * I click the divide element button.
     *
     * @When I click the divide element button
     */
    public function iClickTheDivideElementButton()
    {
        $this->navigationContext->getPage('synthesis edition page')->divideElement();
        $this->iWait(2);
    }

    /**
     * I click the create element division button.
     *
     * @When I click the create element division button
     */
    public function iClickTheCreateElementDivisionButton()
    {
        $this->navigationContext->getPage('synthesis edition page')->createDivisionElement();
        $this->iWait(2);
    }

    /**
     * I click the new folder button.
     *
     * @When I click the new folder button
     */
    public function iClickTheNewFolderButton()
    {
        $this->clickLink('Nouveau dossier');
        $this->iWait(2);
    }

    /**
     * I create a new synthesis element.
     *
     * @When I create a new synthesis element
     */
    public function iCreateANewSynthesisElement()
    {
        $this->navigationContext->getPage('synthesis edition page')->createNewElement();
        $this->iWait(2);
    }

    /**
     * I should see my newly created element in the archived inbox.
     *
     * @Then I should see my newly created element in the archived inbox
     */
    public function iShouldSeeMyNewlyCreatedElementInTheArchivedInbox()
    {
        $this->iGoToTheArchivedInbox();
        $this->iShouldSeeTheArchivedSynthesisElements(15);
        $this->assertPageContainsText('Bisous');
    }
}
