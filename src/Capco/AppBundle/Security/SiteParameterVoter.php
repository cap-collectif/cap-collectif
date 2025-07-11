<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

/**
 * @template TAttribute of string
 * @template TSubject of SiteParameter
 * @extends Voter<TAttribute, TSubject>
 */
class SiteParameterVoter extends Voter
{
    final public const VIEW = 'view';

    /**
     * @param string $attribute An attribute
     * @param mixed  $subject   The subject to secure, e.g. an object the user wants to access or any other PHP type
     */
    protected function supports($attribute, $subject): bool
    {
        if (!\in_array($attribute, [self::VIEW])) {
            return false;
        }

        if (!$subject instanceof SiteParameter) {
            return false;
        }

        return true;
    }

    protected function voteOnAttribute($attribute, $subject, TokenInterface $token): bool
    {
        $viewer = $token->getUser() instanceof User ? $token->getUser() : null;

        $siteParameter = $subject;

        return match ($attribute) {
            self::VIEW => $this->canView($siteParameter, $viewer),
            default => throw new \LogicException('This code should not be reached!'),
        };
    }

    private function canView(SiteParameter $siteParameter, ?User $viewer): bool
    {
        $whiteList = [
            'login.text.top',
            'login.text.bottom',
            'charter.body',
            'privacy-policy',
            'global.site.organization_name',
            'global.site.communication_from',
            'global.site.fullname',
            'projects.metadescription',
            'global.site.embed_js',
            'snalytical-tracking-scripts-on-all-pages',
            'ad-scripts-on-all-pages',
            'projects.jumbotron.title',
            'projects.jumbotron.body',
            'projects.content.body',
            'projects.metadescription',
            'projects.customcode',
            'shield.introduction',
            'cookies-list',
            'footer.text.title',
            'footer.text.body',
            'homepage.metadescription',
            'contact.title',
            'contact.metadescription',
            'contact.content.body',
            'contact.customcode',
        ];
        $key = $siteParameter->getKeyname();

        if (\in_array($key, $whiteList)) {
            return true;
        }

        if (!$viewer) {
            return false;
        }

        return $viewer->isProjectAdmin();
    }
}
