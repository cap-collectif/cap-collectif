<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class OpinionVersionPage extends Page
{
    use PageTrait;

    public $elements = [
        // Version
        'delete button' => '#opinion-delete',
        'confirm delete button' => '#confirm-opinion-delete',
        'show all votes button' => '#opinion-votes-show-all',
        'votes in modal' => '.opinion__votes__more__modal .opinion__votes__userbox',
        'share button' => 'opinion-share-button',
        'report button' => '#report-opinion-version1-button',
        // Tabs
        'sources tab' => '#opinion-page-tabs-tab-sources',
        'arguments tab' => '#opinion-page-tabs-tab-arguments',
        // Arguments
        'argument yes field' => '#argument-form--FOR textarea',
        'argument yes button' => '#argument-form--FOR button',
        'argument no field' => '#argument-form--AGAINST textarea',
        'argument no button' => '#argument-form--AGAINST button',
        'arguments yes box' => '#opinion__arguments--FOR',
        'arguments no box' => '#opinion__arguments--AGAINST',
        'argument edit button' => '#arg-argument204 .argument__btn--edit',
        'argument edit body field' => '#argument-form #argument-body',
        'argument edit confirm checkbox' => '#argument-form #argument-confirm',
        'argument edit submit button' => '#confirm-argument-update',
        'argument delete button' => '#arg-argument204 .argument__btn--delete',
        'argument confirm delete button' => '#confirm-argument-delete',
        'argument votes counter' => '#arg-argument204 .opinion__votes-nb',
        'argument vote button' => '#arg-argument204 .argument__btn--vote',
        'argument vote button in closed step' => '#arg-argument212 .argument__btn--vote',
        'argument report button' => '#arg-argument204 .argument__btn--report',
        // Sources
        'sources add' => '#source-form__add',
        'first source vote count' => '#sources-list li:first-child .opinion__votes-nb',
        'vote first source' => '#sources-list li:first-child .source__btn--vote',
    ];

    /**
     * @var string
     */
    protected $path = '/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/versions/{versionSlug}';

    public function clickSourcesTab()
    {
        $this->getElement('sources tab')->click();
    }

    public function clickArgumentsTab()
    {
        $this->getElement('arguments tab')->click();
    }

    public function clickAddSource()
    {
        $this->getElement('sources add')->click();
    }

    public function clickShareButton()
    {
        $this->getElement('share button')->click();
    }

    public function clickReportButton()
    {
        $this->getElement('report button')->click();
    }

    public function getFirstSourceVoteCounter()
    {
        return $this->getElement('first source vote count')->getText();
    }

    public function voteForFirstSource()
    {
        $this->getElement('vote first source')->click();
    }

    public function clickDeleteButton()
    {
        $this->getElement('delete button')->click();
    }

    public function confirmDeletion()
    {
        $this->getElement('confirm delete button')->click();
    }

    public function getDeleteButtonSelector()
    {
        return $this->getSelector('delete button');
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

    public function submitArgument($type, $text)
    {
        $field = $this->getElement('Argument ' . $type . ' field');
        $button = $this->getElement('Argument ' . $type . ' button');
        $field->setValue($text);
        $button->press();
    }

    public function getArgumentsYesBoxSelector()
    {
        return $this->getSelector('arguments yes box');
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

    public function getArgumentVotesCount()
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

    public function clickArgumentVoteButton()
    {
        return $this->getArgumentVoteButton()->click();
    }

    public function getArgumentVoteButtonLabel()
    {
        return $this->getArgumentVoteButton()->getText();
    }

    public function clickArgumentReportButton()
    {
        $this->getElement('argument report button')->click();
    }
}
