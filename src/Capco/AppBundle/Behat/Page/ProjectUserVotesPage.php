<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class ProjectUserVotesPage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/projects/{projectSlug}/votes';

    public $elements = [
        'vote table' => '.proposals-user-votes__table',
        'vote' => '.proposals-user-votes__row',
        'first vote button' => '.proposals-user-votes__table .proposals-user-votes__row:nth-child(1) .proposal-vote__delete'
    ];

    public function countVotes()
    {
        $table = $this->getElement('vote table');
        return count($table->find('css', '.proposals-user-votes__row'));
    }

    public function removeFirstVote()
    {
        $this->getElement('first vote button')->click();
    }
}
