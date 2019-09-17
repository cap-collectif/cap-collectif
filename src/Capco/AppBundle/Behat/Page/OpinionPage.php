<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use PHPUnit\Framework\Assert;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class OpinionPage extends Page
{
    use PageTrait;

    public $elements = [
        // Tabs
        'sources tab' => '#opinion-page-tabs-tab-sources',
        'arguments tab' => '#opinion-page-tabs-tab-arguments',
        'versions tab' => '#opinion-page-tabs-tab-versions',
        'connections tab' => '#opinion-page-tabs-tab-links',
        'votes evolution tab' => '#opinion-page-tabs-tab-votesevolution',
        // Opinion
        'show all votes button' => '#opinion-votes-show-all',
        'votes in modal' => '.opinion__votes__more__modal .opinion__votes__userbox',
        'share button' => '#opinion-share-button',
        // Arguments
        'argument yes field' => '#argument-form--FOR textarea',
        'argument yes button' => '#argument-form--FOR button',
        'argument no field' => '#argument-form--AGAINST textarea',
        'argument no button' => '#argument-form--AGAINST button',
        'arguments yes box' => '#opinion__arguments--FOR',
        'unpublished arguments yes box' => '#opinion__unpublished--arguments--FOR',
        'arguments no box' => '#opinion__arguments--AGAINST',
        'argument edit button' => '#arg-argument1 .argument__btn--edit',
        'argument edit body field' => '#argument-form #argument-body',
        'argument edit confirm checkbox' => '#argument-form #argument-confirm',
        'argument edit submit button' => '#confirm-argument-update',
        'argument delete button' => '#arg-argument1 .argument__btn--delete',
        'argument confirm delete button' => '#confirm-argument-delete',
        'argument votes counter' => '#arg-argument1 .opinion__votes-nb',
        'argument vote button' => '#arg-argument1 .argument__btn--vote',
        'argument vote button in closed step' => '#arg-argument201 .argument__btn--vote',
        'argument report button' => '#report-argument-argument1-button',
        // Sources
        'sources list' => '#sources-list',
        'add source button' => '#source-form__add',
        'source vote button' => '#sources-list .list-group-item:first-child .source__btn--vote',
        'first source vote count' => '#source-source35 .opinion__votes-nb',
        'source create title field' => '#source-form #sourceTitle',
        'source create body field' => '#source-form #sourceBody .ql-editor',
        'source create link field' => '#source-form #sourceLink',
        'source create category select' => '#source-form #sourceCategory',
        'source create submit button' => '#confirm-opinion-source-create',
        'source edit button' => '#source-source35 .source__btn--edit',
        'source edit body field' => '#source-form #sourceBody .ql-editor',
        'source edit confirm checkbox' => '#source-form #sourceEditCheck',
        'source edit submit button' => '#confirm-opinion-source-update',
        'source delete button' => '#source-source35 .source__btn--delete',
        'source confirm delete button' => '#confirm-opinion-source-delete',
        'source report button' => '#source-source36 .source__btn--report'
    ];

    /**
     * @var string
     */
    protected $path = '/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}';

    /**
     * Overload to verify if we're on an expected page. Throw an exception otherwise.
     */
    public function verifyPage()
    {
        if (
            !$this->getSession()->wait(
                5000,
                "$('#OpinionBox').length > 0 && $('#opinion__arguments--AGAINST').length > 0 && $('#opinion-page-tabs').length > 0"
            )
        ) {
            throw new \RuntimeException(
                'OpinionPage did not fully load, check selector in "verifyPage".'
            );
        }
    }

    public function clickSourcesTab()
    {
        $this->getElement('sources tab')->click();
    }

    public function clickArgumentsTab()
    {
        $this->getElement('arguments tab')->click();
    }

    public function clickVersionsTab()
    {
        $this->getElement('versions tab')->click();
    }

    public function checkTopVersion($version)
    {
        $element = $this->find('css', '#versions-list .Title__Container-sc-16bpy8r-0 a');
        $text = $element->getText();
        Assert::assertEquals($version, $text);
    }

    public function clickConnectionsTab()
    {
        $this->getElement('connections tab')->click();
    }

    public function clickVotesEvolutionTab()
    {
        $this->getElement('votes evolution tab')->click();
    }

    public function clickAddSource()
    {
        $this->getElement('add source button')->click();
    }

    public function clickShareButton()
    {
        $this->getElement('share button')->click();
    }

    public function clickShowAllVotesButton()
    {
        $this->getElement('show all votes button')->click();
    }

    public function getVotesInModalSelector()
    {
        return $this->getSelector('votes in modal');
    }

    // ************************************* Arguments *********************************************************

    public function getArgumentsYesBoxSelector()
    {
        return $this->getSelector('arguments yes box');
    }

    public function getUnpublishedArgumentsYesBoxSelector()
    {
        return $this->getSelector('unpublished arguments yes box');
    }

    public function getArgumentsNoBoxSelector()
    {
        return $this->getSelector('arguments no box');
    }

    public function getArgumentVotesCounter()
    {
        return $this->getElement('argument votes counter');
    }

    public function getArgumentVotesCountSelector(): string
    {
        return $this->getSelector('argument votes counter');
    }

    public function getArgumentVotesCount(): int
    {
        return (int) $this->getArgumentVotesCounter()->getText();
    }

    public function clickArgumentEditButton()
    {
        $this->getElement('argument edit button')->click();
    }

    public function fillArgumentBodyField($str = 'Je modifie mon argument !')
    {
        $this->getElement('argument edit body field')->setValue($str);
    }

    public function checkArgumentConfirmCheckbox()
    {
        $this->getElement('argument edit confirm checkbox')->check();
    }

    public function submitArgumentEditForm()
    {
        $this->getElement('argument edit submit button')->click();
    }

    public function getArgumentDeleteButtonSelector(): string
    {
        return $this->getSelector('argument delete button');
    }

    public function clickArgumentDeleteButton()
    {
        $this->getElement('argument delete button')->click();
    }

    public function getArgumentConfirmDeletionButtonSelector(): string
    {
        return $this->getSelector('argument confirm delete button');
    }

    public function clickArgumentConfirmDeletionButton()
    {
        $this->getElement('argument confirm delete button')->click();
    }

    public function getArgumentVoteButton($inClosedStep = false)
    {
        if ($inClosedStep) {
            return $this->getElement('argument vote button in closed step');
        }

        return $this->getElement('argument vote button');
    }

    public function getArgumentVoteButtonSelector(bool $inClosedStep = false): string
    {
        if ($inClosedStep) {
            return $this->getSelector('argument vote button in closed step');
        }

        return $this->getSelector('argument vote button');
    }

    public function clickArgumentVoteButton()
    {
        return $this->getArgumentVoteButton()->click();
    }

    public function getArgumentVoteButtonLabel()
    {
        return $this->getArgumentVoteButton()->getText();
    }

    public function submitArgument($type, $text)
    {
        $field = $this->getElement("argument ${type} field");
        $button = $this->getElement("argument ${type} button");
        $field->setValue($text);
        $button->press();
    }

    public function clickArgumentReportButton()
    {
        $this->getElement('argument report button')->click();
    }

    // ***************************** Sources *****************************************

    public function getSourcesListSelector()
    {
        return $this->getSelector('sources list');
    }

    public function getFirstSourceVotesCounter()
    {
        return $this->getElement('first source vote count');
    }

    public function getSourceVotesCount(): int
    {
        return (int) $this->getFirstSourceVotesCounter()->getText();
    }

    public function clickSourceVoteButton()
    {
        $this->getElement('source vote button')->click();
    }

    public function getSourceVoteButtonLabel()
    {
        return $this->getElement('source vote button')->getText();
    }

    public function fillSourceForm()
    {
        $this->getElement('source create title field')->setValue('Titre de la source');
        $this->getElement('source create body field')->setValue('Contenu de la source');
        $this->getElement('source create link field')->setValue('http://www.google.fr');
        $this->selectSourceCategory();
    }

    public function selectSourceCategory()
    {
        $this->getElement('source create category select')->selectOption('Politique');
    }

    public function submitSourceForm()
    {
        $this->getElement('source create submit button')->click();
    }

    public function getAddSourceButton()
    {
        return $this->getElement('add source button');
    }

    public function clickSourceEditButton()
    {
        $this->getElement('source edit button')->click();
    }

    public function fillSourceBodyField($str = 'Je modifie ma source !')
    {
        $this->getElement('source edit body field')->setValue($str);
    }

    public function checkSourceConfirmCheckbox()
    {
        $this->getElement('source edit confirm checkbox')->check();
    }

    public function submitSourceEditForm()
    {
        $this->getElement('source edit submit button')->click();
    }

    public function clickSourceDeleteButton()
    {
        $this->getElement('source delete button')->click();
    }

    public function clickSourceConfirmDeletionButton()
    {
        $this->getElement('source confirm delete button')->click();
    }

    public function clickSourceReportButton()
    {
        $this->getElement('source report button')->click();
    }
}
