<?php

namespace Capco\AdminBundle\Block;

use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Validator\ErrorElement;
use Sonata\BlockBundle\Block\BaseBlockService;
use Sonata\BlockBundle\Block\BlockContextInterface;
use Sonata\BlockBundle\Model\BlockInterface;
use Sonata\CoreBundle\Model\ManagerInterface;

use Symfony\Bundle\FrameworkBundle\Templating\EngineInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Toggle\Manager;

class RecentPostBlockService extends BaseBlockService
{
    protected $postRepository;
    protected $toggleManager;

    /**
     * @param string           $name
     * @param EngineInterface  $templating
     * @param PostRepository   $repository
     */
    public function __construct($name, EngineInterface $templating, PostRepository $repository, Manager $manager)
    {
        parent::__construct($name, $templating);

        $this->postRepository = $repository;
        $this->toggleManager = $manager;
    }

    public function buildEditForm(FormMapper $formMapper, BlockInterface $block)
    {

        $formMapper->add('settings', 'sonata_type_immutable_array', array(
            'keys' => array(
                array('number', 'integer', array('required' => true)),
                array('title', 'text', array('required' => false)),
                array('toggle', 'text', array('required' => false)),
            )
        ));
    }

    /**
     * {@inheritdoc}
     */
    public function execute(BlockContextInterface $blockContext, Response $response = null)
    {
        if ($flag = $blockContext->getSetting('toggle')) {
            if (!$this->toggleManager->isActive($flag)) {
                return new Response();
            }
        }

        $parameters = array(
            'context'   => $blockContext,
            'settings'  => $blockContext->getSettings(),
            'block'     => $blockContext->getBlock(),
            'posts'     => $this->postRepository->getRecentPosts($blockContext->getSetting('number'))
        );

        return $this->renderPrivateResponse($blockContext->getTemplate(), $parameters, $response);
    }

    public function getName()
    {
        return 'Recent Posts';
    }

    /**
     * {@inheritdoc}
     */
    public function setDefaultSettings(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'number'     => 5,
            'toggle'     => false,
            'title'      => 'Recent Posts',
            'template'   => 'CapcoAdminBundle:Block:recent_posts.html.twig'
        ));
    }

    public function validateBlock(ErrorElement $errorElement, BlockInterface $block)
    {
    }
}
