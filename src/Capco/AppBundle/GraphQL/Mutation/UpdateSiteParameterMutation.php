<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Twig\FooterRuntime;
use Capco\AppBundle\Twig\ParametersRuntime;
use Capco\AppBundle\Twig\SiteParameterRuntime;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\HttpFoundation\RequestStack;

class UpdateSiteParameterMutation implements MutationInterface
{
    use MutationTrait;

    final public const INVALID_VALUE = 'INVALID_VALUE';

    final public const KEYNAME_RECEIVE_ADDRESS = 'admin.mail.notifications.receive_address';
    final public const KEYNAME_SEND_NAME = 'admin.mail.notifications.send_name';

    public function __construct(
        private readonly SiteParameterRepository $repository,
        private readonly SiteParameterRuntime $siteParamRuntime,
        private readonly EntityManagerInterface $entityManager,
        private readonly RedisCache $cache,
        protected RequestStack $requestStack
    ) {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        try {
            self::checkValue($input);
            $siteParameter = $this->getSiteParameter($input);
            self::updateSiteParameter($siteParameter, $input);
            $this->entityManager->flush();
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        $this->invalidateCache($siteParameter);

        return ['siteParameter' => $siteParameter];
    }

    public function invalidateCache(SiteParameter $siteParameter): void
    {
        $locale = $this->requestStack->getCurrentRequest()->getLocale();
        $keyname = $siteParameter->getKeyname();

        $this->siteParamRuntime->invalidateCache($siteParameter->getKeyname());
        $cacheDriver = $this->entityManager->getConfiguration()->getResultCacheImpl();
        $cacheDriver->delete(SiteParameterRepository::getValuesIfEnabledCacheKey($locale));
        $cacheDriver->delete(SiteParameterRepository::getValueCacheKey($locale, $keyname));

        $this->cache->deleteItem(ParametersRuntime::getCacheKey($locale));
        $this->cache->deleteItem(FooterRuntime::generateFooterLegalCacheKey($locale));
        $this->cache->deleteItem(FooterRuntime::generateFooterSocialNetworksCacheKey($locale));
    }

    private function getSiteParameter(Argument $input): SiteParameter
    {
        return $this->repository->findOneByKeyname($input->offsetGet('keyname'));
    }

    private static function updateSiteParameter(SiteParameter $siteParameter, Argument $input): void
    {
        $siteParameter->setValue($input->offsetGet('value'), $input->offsetGet('locale'));
    }

    private static function checkValue(Argument $input): void
    {
        if (self::KEYNAME_RECEIVE_ADDRESS === $input->offsetGet('keyname')) {
            if (!filter_var($input->offsetGet('value'), \FILTER_VALIDATE_EMAIL)) {
                throw new UserError(self::INVALID_VALUE);
            }
        }
    }
}
