<?php

namespace Capco\AppBundle\Behat;

use Behat\Behat\Context\Context;
use Behat\Behat\Hook\Scope\BeforeScenarioScope;
use Behat\MinkExtension\Context\MinkContext;
use Behat\Symfony2Extension\Context\KernelAwareContext;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Security\Core\User\UserInterface;

abstract class DefaultContext extends MinkContext implements Context, KernelAwareContext
{
    protected $navigationContext;

    /**
     * @var KernelInterface
     */
    protected $kernel;

    /** @BeforeScenario */
    public function gatherContexts(BeforeScenarioScope $scope)
    {
        $environment = $scope->getEnvironment();

        $this->navigationContext = $environment->getContext(
            'Capco\AppBundle\Behat\NavigationContext'
        );
    }

    /**
     * {@inheritdoc}
     */
    public function setKernel(KernelInterface $kernel)
    {
        $this->kernel = $kernel;
    }

    /**
     * @Then /^(?:|I )should see '(?P<text>(?:[^']|\\')*)'$/
     *
     * @param mixed $text
     */
    public function assertPageContainsText($text)
    {
        $this->assertSession()->pageTextContains($this->fixStepArgument($text));
    }

    /**
     * Get entity manager.
     *
     * @return ObjectManager
     */
    protected function getEntityManager()
    {
        return $this->getService('doctrine')->getManager();
    }

    /**
     * Get Repository.
     *
     * @param mixed $repo
     */
    protected function getRepository($repo)
    {
        return $this->getEntityManager()->getRepository($repo);
    }

    /**
     * Returns Container instance.
     *
     * @return ContainerInterface
     */
    protected function getContainer()
    {
        return $this->kernel->getContainer();
    }

    /**
     * Get service by id.
     *
     * @param string $id
     *
     * @return object
     */
    protected function getService($id)
    {
        return $this->getContainer()->get($id);
    }

    /**
     * Get parameter by id.
     *
     * @param string $id
     *
     * @return object
     */
    protected function getParameter($id)
    {
        return $this->getContainer()->getParameter($id);
    }

    /**
     * Get current user instance.
     *
     * @throws \Exception
     *
     * @return null|UserInterface
     */
    protected function getUser()
    {
        $token = $this->getService('security.token_storage')->getToken();

        if (null === $token) {
            throw new \Exception('No token found in security context.');
        }

        return $token->getUser();
    }

    /**
     * Generate url.
     *
     * @param string $route
     * @param array  $parameters
     * @param bool   $absolute
     *
     * @return string
     */
    protected function generateUrl($route, array $parameters = [], $absolute = false)
    {
        return $this->locatePath(
            $this->getService('router')->generate($route, $parameters, $absolute)
        );
    }
}
