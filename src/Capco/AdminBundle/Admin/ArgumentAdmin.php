<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Form\Type\TrashedStatusType;
use Doctrine\DBAL\Query\QueryBuilder;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Capco\AppBundle\Enum\ProjectVisibilityMode;

class ArgumentAdmin extends AbstractAdmin
{
    protected $datagridValues = ['_sort_order' => 'DESC', '_sort_by' => 'updatedAt'];
    private $tokenStorage;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        TokenStorageInterface $tokenStorage
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->tokenStorage = $tokenStorage;
    }

    /**
     * if user is supper admin return all else return only what I can see.
     */
    public function createQuery($context = 'list')
    {
        $user = $this->tokenStorage->getToken()->getUser();
        if ($user->hasRole('ROLE_SUPER_ADMIN')) {
            return parent::createQuery($context);
        }

        /** @var QueryBuilder $query */
        $query = parent::createQuery($context);
        $query
            ->leftJoin($query->getRootAliases()[0] . '.opinion', 'op')
            ->innerJoin('op.consultation', 'opc')
            ->innerJoin('opc.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pAs')
            ->leftJoin('pAs.project', 'p')
            ->leftJoin('p.authors', 'authors')
            ->orWhere(
                $query
                    ->expr()
                    ->andX(
                        $query->expr()->eq(':author', 'authors.user'),
                        $query->expr()->eq('p.visibility', ProjectVisibilityMode::VISIBILITY_ME)
                    )
            );
        $query->orWhere(
            $query->expr()->gte('p.visibility', ProjectVisibilityMode::VISIBILITY_ADMIN)
        );
        $query->setParameter('author', $user);

        return $query;
    }

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('type', null, ['label' => 'admin.fields.argument.type'])
            ->add('opinion', null, ['label' => 'global.proposal'])
            ->add(
                'Author',
                'doctrine_orm_model_autocomplete',
                ['label' => 'global.author'],
                null,
                [
                    'property' => 'username,email',
                    'to_string_callback' => function ($enitity, $property) {
                        return $enitity->getEmail() . ' - ' . $enitity->getUsername();
                    }
                ]
            )
            ->add('votesCount', null, ['label' => 'global.vote.count.label'])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('published', null, ['label' => 'global.published'])
            ->add('trashedStatus', null, ['label' => 'global.is_trashed']);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('body', null, [
                'label' => 'global.contenu',
                'template' => 'CapcoAdminBundle:Argument:body_list_field.html.twig'
            ])
            ->add('type', null, [
                'label' => 'admin.fields.argument.type',
                'template' => 'CapcoAdminBundle:Argument:type_list_field.html.twig',
                'typesLabels' => Argument::$argumentTypesLabels
            ])
            ->add('opinion', 'sonata_type_model', ['label' => 'global.proposal'])
            ->add('Author', 'sonata_type_model', ['label' => 'global.author'])
            ->add('votesCount', null, ['label' => 'global.vote.count.label'])
            ->add('published', null, [
                'editable' => false,
                'label' => 'global.published'
            ])
            ->add('trashedStatus', null, [
                'label' => 'global.is_trashed',
                'template' => 'CapcoAdminBundle:Trashable:trashable_status.html.twig'
            ])
            ->add('updatedAt', 'datetime', ['label' => 'global.maj'])
            ->add('_action', 'actions', [
                'actions' => ['show' => [], 'edit' => [], 'delete' => []]
            ]);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('type', 'choice', [
                'label' => 'admin.fields.argument.type',
                'choices' => array_flip(Argument::$argumentTypesLabels),
                'translation_domain' => 'CapcoAppBundle'
            ])
            ->add('published', null, [
                'label' => 'global.published',
                'disabled' => true,
                'attr' => ['readonly' => true]
            ])
            ->add('opinion', 'sonata_type_model_autocomplete', [
                'label' => 'global.proposal',
                'property' => 'title'
            ])
            ->add('Author', 'sonata_type_model_autocomplete', [
                'label' => 'global.author',
                'property' => 'username,email',
                'to_string_callback' => function ($enitity, $property) {
                    return $enitity->getEmail() . ' - ' . $enitity->getUsername();
                }
            ])
            ->add('body', null, ['label' => 'global.contenu', 'attr' => ['rows' => 10]])
            ->add('trashedStatus', TrashedStatusType::class, [
                'label' => 'global.is_trashed'
            ])
            ->add('trashedReason', null, [
                'label' => 'global.trashed_reason',
                'required' => false
            ]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
    }
}
