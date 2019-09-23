<?php

namespace Capco\AppBundle\Behat\Traits;

trait UserProfileTrait
{
    protected static $profile = [
        'userSlug' => 'admin'
    ];

    /**
     * Go to a user profile.
     *
     * @When I go to a user profile
     */
    public function iGoToAUserProfile()
    {
        $this->visitPageWithParams('profile page', self::$profile);
    }

    /**
     * @Then I should see at least one project
     */
    public function iShouldSeeAtLeastOneProject()
    {
        $this->waitAndThrowOnFailure(3000, "$('#profile-project .project-preview').length > 0");
    }

    /**
     * @Then I should see at least one opinion
     */
    public function iShouldSeeAtLeastOneOpinion()
    {
        $this->waitAndThrowOnFailure(3000, "$('#profile-opinion .opinion').length > 0");
    }

    /**
     * @Then I should see at least one version
     */
    public function iShouldSeeAtLeastOneVersion()
    {
        $this->waitAndThrowOnFailure(3000, "$('#profile-version .opinion').length > 0");
    }

    /**
     * @Then I should see at least one argument
     */
    public function iShouldSeeAtLeastOneArgument()
    {
        $this->waitAndThrowOnFailure(3000, "$('#profile-argument .opinion').length > 0");
    }

    /**
     * @Then I should see at least one source
     */
    public function iShouldSeeAtLeastOneSource()
    {
        $this->waitAndThrowOnFailure(3000, "$('#profile-source .opinion').length > 0");
    }

    /**
     * @Then I should see at least one proposal
     */
    public function iShouldSeeAtLeastOneProposal()
    {
        $this->waitAndThrowOnFailure(3000, "$('#profile-proposal .proposal-preview').length > 0");
    }

    /**
     * @Then I should see at least one reply
     */
    public function iShouldSeeAtLeastOneReply()
    {
        $this->waitAndThrowOnFailure(3000, "$('#profile-reply .opinion').length > 0");
    }

    /**
     * @Then I should see at least one vote
     */
    public function iShouldSeeAtLeastOneVote()
    {
        $this->waitAndThrowOnFailure(3000, "$('#profile-vote .opinion').length > 0");
    }
}
