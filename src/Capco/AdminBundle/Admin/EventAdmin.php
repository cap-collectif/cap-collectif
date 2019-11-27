<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\DBAL\Enum\EventReviewStatusType;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\CoreBundle\Model\Metadata;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class EventAdmin extends AbstractAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'DESC',
        '_sort_by' => 'updatedAt',
    ];

    private $indexer;
    private $token;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        Indexer $indexer,
        TokenStorageInterface $token
    ) {
        $this->indexer = $indexer;
        $this->token = $token;

        parent::__construct($code, $class, $baseControllerName);
    }

    public function getFeatures()
    {
        return ['calendar'];
    }

    public function preRemove($object)
    {
        $this->indexer->remove(\get_class($object), $object->getId());
        $this->indexer->finishBulk();
        parent::preRemove($object);
    }

    public function preUpdate($object)
    {
        $this->indexer->index(\get_class($object), $object->getId());
        $this->indexer->finishBulk();
        parent::preUpdate($object);
    }

    public function getTemplate($name)
    {
        if ('create' === $name) {
            return 'CapcoAdminBundle:Event:create.html.twig';
        }
        if ('edit' === $name) {
            return 'CapcoAdminBundle:Event:edit.html.twig';
        }

        return $this->getTemplateRegistry()->getTemplate($name);
    }

    // For mosaic view
    public function getObjectMetadata($object)
    {
        $media = $object->getMedia();
        if ($media) {
            $provider = $this->getConfigurationPool()
                ->getContainer()
                ->get($media->getProviderName());
            $format = $provider->getFormatName($media, 'form');
            $url = $provider->generatePublicUrl($media, $format);

            return new Metadata($object->getTitle(), $object->getBody(), $url);
        }

        return parent::getObjectMetadata($object);
    }

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper->add('title', null, [
            'label' => 'global.title',
        ]);
        if (
            $this->getConfigurationPool()
                ->getContainer()
                ->get(Manager::class)
                ->isActive('themes')
        ) {
            $datagridMapper->add('themes', null, [
                'label' => 'admin.fields.event.themes',
            ]);
        }

        $datagridMapper
            ->add('projects', null, [
                'label' => 'global.participative.project',
            ])
            ->add(
                'author',
                'doctrine_orm_model_autocomplete',
                [
                    'label' => 'admin.fields.event.author',
                ],
                null,
                [
                    'property' => 'email,username',
                    'to_string_callback' => function ($entity, $property) {
                        return $entity->getEmail().' - '.$entity->getUsername();
                    },
                ]
            )
            ->add(
                'status',
                'doctrine_orm_callback',
                [
                    'callback' => function ($queryBuilder, $alias, $field, $value) {
                        if (!$value['value']) {
                            return;
                        }

                        if (\in_array($value['value'], EventReviewStatusType::$eventReviewStatus)) {
                            $queryBuilder->leftJoin(sprintf('%s.review', $alias), 'r');
                            $queryBuilder->andWhere('r.status = :status');
                            $queryBuilder->setParameter('status', $value['value']);
                        } else {
                            $queryBuilder->andWhere(sprintf('%s.enabled  = :status', $alias));
                            $queryBuilder->setParameter(
                                'status',
                                EventReviewStatusType::PUBLISHED === $value['value']
                            );
                        }

                        return true;
                    },
                    'mapped' => false,
                    'label' => 'global.published',
                    'translation_domain' => 'CapcoAppBundle',
                ],
                'choice',
                [
                    'choices' => array_flip(EventReviewStatusType::$eventStatusesLabels),
                    'translation_domain' => 'CapcoAppBundle',
                ]
            )
            ->add('commentable', null, [
                'label' => 'admin.fields.event.is_commentable',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ])
            ->add('startAt', 'doctrine_orm_datetime_range', [
                'label' => 'start-at',
            ])
            ->add('endAt', 'doctrine_orm_datetime_range', [
                'label' => 'end-at',
            ])
            ->add('createdAt', 'doctrine_orm_datetime_range', [
                'label' => 'global.creation',
            ]);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'global.title',
            ])
            ->add('startAt', null, [
                'label' => 'start-date',
            ])
            ->add('endAt', null, [
                'label' => 'end-date',
            ]);
        if (
            $this->getConfigurationPool()
                ->getContainer()
                ->get(Manager::class)
                ->isActive('themes')
        ) {
            $listMapper->add('themes', null, [
                'label' => 'admin.fields.event.themes',
            ]);
        }
        /** @var User $viewer */
        $viewer = $this->token->getToken()->getUser();

        if ($viewer->isSuperAdmin()) {
            $listMapper
                ->add('newAddressIsSimilar', null, [
                    'label' => 'isSimilar',
                ])
                ->add('similarityOfNewAddress', null, [
                    'label' => 'similarityOfNewAddress',
                ]);
        }

        $listMapper
            ->add('projects', null, [
                'label' => 'global.participative.project',
            ])
            ->add('author', 'sonata_type_model', [
                'label' => 'admin.fields.event.author',
            ])
            ->add('status', null, [
                'mapped' => false,
                'label' => 'registration.type',
                'template' => 'CapcoAdminBundle:Event:status_list_field.html.twig',
                'statusLabels' => EventReviewStatusType::$eventStatusesLabels,
            ])
            ->add('commentsCount', null, [
                'label' => 'global.comments.label',
                'template' => 'CapcoAdminBundle:Event:comments_list_field.html.twig',
            ])
            ->add('registrations', null, [
                'label' => 'registrations',
                'template' => 'CapcoAdminBundle:Event:registrations_list_field.html.twig',
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ])
            ->add('_action', 'actions', [
                'label' => 'members',
                'actions' => [
                    'registrations' => [
                        'template' => 'CapcoAdminBundle:CRUD:list__action_registrations.html.twig',
                    ],
                ],
            ]);
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, [
                'label' => 'global.title',
            ])
            ->add('body', null, [
                'label' => 'global.contenu',
            ])
            ->add('startAt', null, [
                'label' => 'admin.fields.event.start_at',
            ])
            ->add('endAt', null, [
                'label' => 'admin.fields.event.end_at',
            ]);
        if (
            $this->getConfigurationPool()
                ->getContainer()
                ->get(Manager::class)
                ->isActive('themes')
        ) {
            $showMapper->add('themes', null, [
                'label' => 'admin.fields.event.themes',
            ]);
        }

        $showMapper
            ->add('project', null, [
                'label' => 'admin.fields.event.project',
            ])
            ->add('author', null, [
                'label' => 'admin.fields.event.author',
            ])
            ->add('media', 'sonata_media_type', [
                'template' => 'CapcoAdminBundle:Event:media_show_field.html.twig',
                'provider' => 'sonata.media.provider.image',
                'label' => 'global.image',
            ])
            ->add('enabled', null, [
                'label' => 'global.published',
            ])
            ->add('commentable', null, [
                'label' => 'admin.fields.event.is_commentable',
            ])
            ->add('commentsCount', null, [
                'label' => 'global.comments.label',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
            ->add('address', null, [
                'label' => 'admin.fields.event.address',
            ])
            ->add('zipCode', 'number', [
                'label' => 'user.register.zipcode',
            ])
            ->add('city', null, [
                'label' => 'admin.fields.event.city',
            ])
            ->add('country', null, [
                'label' => 'admin.fields.event.country',
            ])
            ->add('lat', null, [
                'label' => 'proposal_form.lat_map',
            ])
            ->add('lng', null, [
                'label' => 'proposal_form.lng_map',
            ]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['batch', 'list', 'create', 'delete', 'show', 'edit']);
    }
}
