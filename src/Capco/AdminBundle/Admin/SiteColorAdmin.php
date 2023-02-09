<?php

namespace Capco\AdminBundle\Admin;

use Doctrine\ORM\EntityManagerInterface;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Capco\AppBundle\Repository\SiteColorRepository;

class SiteColorAdmin extends AbstractAdmin
{
    protected ?string $classnameLabel = 'site_color';
    protected array $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'isEnabled',
    ];

    private EntityManagerInterface $entityManager;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        EntityManagerInterface $entityManager
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->entityManager = $entityManager;
    }

    public function toString($object): string
    {
        if (!\is_object($object)) {
            return '';
        }

        if (method_exists($object, '__toString') && null !== $object->__toString()) {
            return $this->getTranslator()->trans((string) $object, [], 'CapcoAppBundle');
        }

        return parent::toString($object);
    }

    public function postUpdate($object): void
    {
        $cacheDriver = $this->entityManager->getConfiguration()->getResultCacheImpl();
        $cacheDriver->delete(SiteColorRepository::getValuesIfEnabledCacheKey());
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $form
            ->add('isEnabled', null, [
                'label' => 'global.published',
                'required' => false,
            ])
            ->add('value', null, [
                'label' => 'global.value',
                'attr' => ['class' => 'minicolors-input'],
            ]);
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['edit']);
    }
}
