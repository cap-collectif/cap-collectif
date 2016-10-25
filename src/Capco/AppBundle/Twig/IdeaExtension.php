<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Helper\IdeaHelper;

class IdeaExtension extends \Twig_Extension
{
    protected $helper;

    public function __construct(IdeaHelper $helper)
    {
        $this->helper = $helper;
    }

    public function getFilters(): array
    {
        return [
            new \Twig_SimpleFilter('capco_idea_user_voted', [$this, 'hasVoted']),
        ];
    }

    public function hasVoted($idea, $user)
    {
        return $this->helper->findUserVoteOrCreate($idea, $user)->isConfirmed();
    }
}
