<?php
namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\SiteParameter;
use Doctrine\ORM\Event\LifecycleEventArgs;
use Symfony\Component\Cache\Adapter\AdapterInterface;

class SiteParameterListener
{
    private $cacheDriver;

    public function __construct(AdapterInterface $redisStorageHelper)
    {
        $this->cacheDriver = $redisStorageHelper;
    }

    public function postPersist(SiteParameter $siteParameter, LifecycleEventArgs $args)
    {
        $this->updateMailjetKeysCache($siteParameter);
    }

    public function postUpdate(SiteParameter $siteParameter, LifecycleEventArgs $args)
    {
        $this->updateMailjetKeysCache($siteParameter);
    }

    public function postRemove(SiteParameter $siteParameter, LifecycleEventArgs $args)
    {
        if ($siteParameter->getKeyname() === 'mailjet.keys.public') {
            $this->cacheDriver->deleteItem('mailjet_key');
        }

        if ($siteParameter->getKeyname() === 'mailjet.keys.secret') {
            $this->cacheDriver->deleteItem('mailjet_secret');
        }
    }

    protected function updateMailjetKeysCache(SiteParameter $siteParameter): void
    {
        if (
            $siteParameter->getKeyname() === 'mailjet.keys.public' &&
            !empty($siteParameter->getValue())
        ) {
            $this->cacheDriver->save(
                $this->cacheDriver->getItem('mailjet_key')->set($siteParameter->getValue())
            );
        }

        if (
            $siteParameter->getKeyname() === 'mailjet.keys.secret' &&
            !empty($siteParameter->getValue())
        ) {
            $this->cacheDriver->save(
                $this->cacheDriver->getItem('mailjet_secret')->set($siteParameter->getValue())
            );
        }
    }
}
