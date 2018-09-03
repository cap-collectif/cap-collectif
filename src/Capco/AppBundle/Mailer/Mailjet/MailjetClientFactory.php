<?php
namespace Capco\AppBundle\Mailer\Mailjet;

use Capco\AppBundle\SiteParameter\Resolver;
use Mailjet\Client;
use Symfony\Component\Cache\Adapter\AdapterInterface;

class MailjetClientFactory
{
    protected $siteParametersResolver;
    protected $cache;

    public function __construct(Resolver $siteParametersResolver, AdapterInterface $cache)
    {
        $this->siteParametersResolver = $siteParametersResolver;
        $this->cache = $cache;
    }

    public function createMailjetClient(?string $key = null, ?string $secret = null): Client
    {
        $mailjetKey = $this->cache->getItem('mailjet_key');
        $mailjetSecret = $this->cache->getItem('mailjet_secret');

        if ($mailjetKey->isHit() && $mailjetSecret->isHit()) {
            return new Client($mailjetKey, $mailjetSecret);
        }

        $mailjetKey = $this->siteParametersResolver->getValue('mailjet.keys.public');
        $mailjetSecret = $this->siteParametersResolver->getValue('mailjet.keys.secret');

        if ($mailjetKey && !empty($mailjetKey) && $mailjetSecret && !empty($mailjetSecret)) {
            $this->cache->save($this->cache->getItem('mailjet_key')->set($mailjetKey));
            $this->cache->save($this->cache->getItem('mailjet_secret')->set($mailjetSecret));

            return new Client($mailjetKey, $mailjetSecret);
        }

        return new Client($key, $secret);
    }
}
