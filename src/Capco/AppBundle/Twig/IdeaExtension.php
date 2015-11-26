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

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'capco_idea_helper';
    }

    public function getFilters()
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
