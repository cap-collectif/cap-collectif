<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class ProjectUserVotesPage extends Page
{
    use PageTrait;

    public $elements = [
        'vote table' => '.proposals-user-votes__table',
        'vote' => '.proposals-user-votes__row',
        'first vote button' =>
            '.proposals-user-votes__table .proposals-user-votes__row:nth-child(1) .proposal-vote__delete',
        'confirm vote delete' => '.popover-content .proposal-vote__delete-confirm',
        'toggle vote access' =>
            ' > div > div > div > label > div > div.react-toggle-track > div.react-toggle-track-check',
    ];

    /**
     * @var string
     */
    protected $path = '/projects/{projectSlug}/votes';

    public function countVotes()
    {
        return \count($this->getElement('vote table')->findAll('css', '.proposal-vote__delete'));
    }

    public function removeFirstVote()
    {
        $this->getElement('first vote button')->click();
        $this->getElement('confirm vote delete')->click();
    }

    public function toggleVoteAccess($proposalId)
    {
        $element = $proposalId . $this->elements['toggle vote access'];

        return $this->find('css', $element)->click();
    }

    public function deleteProposalVote($proposalId)
    {
        $element = $proposalId . '-delete';
        $element = "[id='${element}']";

        return $this->find('css', $element)->click();
    }
}
