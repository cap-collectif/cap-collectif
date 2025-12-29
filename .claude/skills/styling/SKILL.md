---
name: styling
description: Guide de styling avec CapUI (@cap-collectif/ui). Couvre layout, spacing, couleurs, responsive, theming et composants UI. Ne pas utiliser styled-components.
---

# Styling avec CapUI

Guide pour styler les composants avec `@cap-collectif/ui`. **Ne pas utiliser styled-components** - privilegier les props CapUI et le prop `sx` pour tous les styles.

## Imports

```typescript
// Composants de base
import {
  Box, Flex, Grid, Text, Heading,
  Button, Icon, Avatar, Card, Modal,
  Accordion, InfoMessage, Spinner, Tooltip
} from '@cap-collectif/ui'

// Constantes et enums
import {
  CapUIIcon,
  CapUIIconSize,
  CapUIFontSize,
  CapUIFontWeight,
  CapUILineHeight,
  CapUIModalSize,
  CapUIAccordionColor,
  CapUIShadow,
  CapUIRadius
} from '@cap-collectif/ui'

// Formulaires (package separe)
import { FieldInput, FormControl } from '@cap-collectif/form'
```

## Layout

### Flex (conteneur flexible)

```typescript
<Flex
  direction="column"           // row | column | row-reverse | column-reverse
  align="center"               // alignItems: flex-start | center | flex-end | stretch
  justify="space-between"      // justifyContent: flex-start | center | flex-end | space-between
  wrap="wrap"                  // flexWrap: nowrap | wrap | wrap-reverse
  gap={4}                      // Espacement entre enfants (number = spacing scale)
  spacing="md"                 // Alternative semantique pour gap
>
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</Flex>
```

### Box (conteneur generique)

```typescript
<Box
  as="section"                 // Polymorphisme: div, section, article, aside, etc.
  p={4}                        // padding
  m={2}                        // margin
  bg="gray.100"                // backgroundColor
  borderRadius="normal"        // border-radius
  boxShadow={CapUIShadow.Small}
  position="relative"
  width="100%"
  maxWidth="600px"
>
  Contenu
</Box>
```

### Grid

```typescript
<Grid
  templateColumns="repeat(3, 1fr)"    // grid-template-columns
  templateRows="auto"                  // grid-template-rows
  gap={4}                              // gap
  autoFlow="row"                       // grid-auto-flow
>
  <Box>Cell 1</Box>
  <Box>Cell 2</Box>
  <Box>Cell 3</Box>
</Grid>

// Responsive grid
<Grid
  templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
  gap={{ base: 2, md: 4 }}
>
  {/* ... */}
</Grid>
```

## Spacing (Padding & Margin)

### Tokens semantiques (privilegier)

| Token | Valeur | Usage |
|-------|--------|-------|
| `"0"` | 0px | Aucun espace |
| `"px"` | 1px | Bordures fines |
| `"xxs"` | 4px | Tres petit |
| `"xs"` | 8px | Petit |
| `"sm"` | 12px | Moyen-petit |
| `"md"` | 16px | Standard |
| `"lg"` | 24px | Grand |
| `"xl"` | 32px | Tres grand |
| `"xxl"` | 48px | Extra large |
| `"xxxl"` | 64px | Enorme |

### Props de spacing

```typescript
// Padding
<Box p="md" />           // padding: 16px (all sides)
<Box px="lg" />          // padding-left + padding-right: 24px
<Box py="sm" />          // padding-top + padding-bottom: 12px
<Box pt="xs" pb="md" />  // padding-top: 8px, padding-bottom: 16px
<Box pl={4} pr={4} />    // Valeurs numeriques (4 = 16px)

// Margin
<Box m="md" />           // margin: 16px
<Box mx="auto" />        // margin-left + margin-right: auto (centrage)
<Box mt="lg" mb="sm" />  // margin-top: 24px, margin-bottom: 12px
<Box ml="auto" />        // Pousse a droite dans un flex

// Negatif
<Box mt="-sm" />         // margin-top: -12px
```

## Couleurs

### Palette

Préférer les tokens sémantiques aux valeurs numériques (exemple : primary.500 → primary.base).


```typescript
// Couleurs primaires (configurables par theme)
primary.50   // Tres clair
primary.100
primary.200
primary.300
primary.400
primary.500  // Base
primary.600
primary.700
primary.800
primary.900  // Tres fonce

// Gris
gray.50 → gray.900

// Semantiques
blue.100 → blue.900
red.100 → red.900     // Erreurs, danger
green.100 → green.900 // Succes
yellow.100 → yellow.900 // Warning
```

### Usage

```typescript
<Box
  bg="gray.100"              // Background
  color="gray.900"           // Text color
  borderColor="gray.300"     // Border color
/>

<Text color="primary.600">Texte principal</Text>
<Text color="red.500">Erreur</Text>
<Text color="gray.500">Texte secondaire</Text>
```

## Typographie

### Text

```typescript
<Text
  fontSize={CapUIFontSize.BodyRegular}  // BodySmall (12px) | BodyRegular (14px) | BodyLarge (16px)
  fontWeight={CapUIFontWeight.Semibold} // Normal | Medium | Semibold | Bold
  lineHeight={CapUILineHeight.M}        // S | M | L
  color="gray.700"
  textAlign="center"
  truncate                              // text-overflow: ellipsis (1 ligne)
  lineClamp={2}                         // Limite a 2 lignes avec ellipsis
>
  Contenu texte
</Text>
```

### Heading

```typescript
<Heading
  as="h1"                    // h1 | h2 | h3 | h4 | h5 | h6
  color="blue.900"
  mb="md"
>
  Titre principal
</Heading>

// Tailles par defaut selon le niveau
// h1: 32px, h2: 24px, h3: 20px, h4: 18px, h5: 16px, h6: 14px
```

## Responsive Design

### Breakpoints

| Breakpoint | Valeur | Usage |
|------------|--------|-------|
| `base` | 0px+ | Mobile first (defaut) |
| `sm` | 480px+ | Petit mobile |
| `md` | 768px+ | Tablette |
| `lg` | 992px+ | Desktop |
| `xl` | 1280px+ | Grand ecran |

### Props responsive

```typescript
<Box
  p={{ base: 'sm', md: 'lg', lg: 'xl' }}
  display={{ base: 'none', md: 'block' }}
  flexDirection={{ base: 'column', lg: 'row' }}
  width={{ base: '100%', md: '50%', lg: '33%' }}
/>

<Grid
  templateColumns={{
    base: '1fr',
    md: 'repeat(2, 1fr)',
    lg: 'repeat(3, 1fr)'
  }}
/>
```

### Hook useIsMobile

```typescript
import useIsMobile from '@hooks/useIsMobile'

const MyComponent = () => {
  const isMobile = useIsMobile()

  return isMobile ? <MobileView /> : <DesktopView />
}
```

### Affichage conditionnel

```typescript
// Cacher sur mobile
<Box display={{ base: 'none', md: 'block' }}>
  Desktop only
</Box>

// Afficher uniquement sur mobile
<Box display={{ base: 'block', md: 'none' }}>
  Mobile only
</Box>
```

## Prop `sx` (styles custom)

Pour les styles non couverts par les props, utiliser `sx` :

```typescript
<Box
  sx={{
    // Pseudo-elements
    '&::before': {
      content: '""',
      position: 'absolute',
      // ...
    },

    // Animations
    transition: 'all 0.2s ease',
    transform: 'translateY(-2px)',

    // Styles complexes
    backgroundImage: 'linear-gradient(to right, #000, #fff)',
    clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)',
  }}
/>
```

## Etats interactifs

```typescript
<Flex
  as="button"
  cursor="pointer"
  _hover={{
    bg: 'gray.100',
    color: 'primary.600',
    transform: 'translateY(-1px)',
  }}
  _focus={{
    outline: 'none',
    boxShadow: 'outline',
  }}
  _active={{
    bg: 'gray.200',
    transform: 'translateY(0)',
  }}
  _disabled={{
    opacity: 0.5,
    cursor: 'not-allowed',
  }}
>
  Clickable
</Flex>
```

## Composants UI

### Button

```typescript
<Button
  variant="primary"           // primary | secondary | tertiary | link
  variantSize="medium"        // big | medium | small
  variantColor="primary"      // primary | danger | hierarchy | success
  leftIcon={CapUIIcon.Add}    // Icone a gauche
  rightIcon={CapUIIcon.ArrowRight}
  isLoading={isSubmitting}
  disabled={!isValid}
  onClick={handleClick}
  type="submit"               // button | submit | reset
>
  {intl.formatMessage({ id: 'global.save' })}
</Button>
```

### Modal

```typescript
<Modal
  show={isOpen}
  onClose={onClose}
  size={CapUIModalSize.Md}    // Sm | Md | Lg | Xl
  ariaLabel="Modal title"
  fullSizeOnMobile            // Plein ecran sur mobile
  hideOnClickOutside={false}  // Empeche fermeture au clic exterieur
>
  <Modal.Header>
    <Heading as="h4" color="blue.900">Titre</Heading>
  </Modal.Header>

  <Modal.Body spacing={4}>
    {/* Contenu */}
  </Modal.Body>

  <Modal.Footer>
    <Button variant="tertiary" onClick={onClose}>
      {intl.formatMessage({ id: 'global.cancel' })}
    </Button>
    <Button variant="primary" onClick={handleSubmit}>
      {intl.formatMessage({ id: 'global.confirm' })}
    </Button>
  </Modal.Footer>
</Modal>
```

### Card

```typescript
import {
  Card, CardCover, CardCoverImage,
  CardCoverPlaceholder, CardContent, CardTagList
} from '@cap-collectif/ui'

<Card
  format="vertical"           // vertical | horizontal
  sx={{ boxShadow: CapUIShadow.Small }}
>
  <CardCover>
    {imageUrl ? (
      <CardCoverImage src={imageUrl} alt={title} />
    ) : (
      <CardCoverPlaceholder icon={CapUIIcon.FolderO} color="primary.base" />
    )}
  </CardCover>
  <CardContent
    primaryInfo={title}
    secondaryInfo={description}
    href={url}
    primaryInfoTag="h2"
  >
    <CardTagList>
      <Text fontSize="sm" color="gray.500">{date}</Text>
    </CardTagList>
  </CardContent>
</Card>
```

### Icon

```typescript
<Icon
  name={CapUIIcon.Pencil}
  size={CapUIIconSize.Md}      // Sm (16px) | Md (20px) | Lg (24px) | Xl (32px)
  color="gray.500"
/>

// Icones courantes
CapUIIcon.Add        // +
CapUIIcon.Trash      // Poubelle
CapUIIcon.Pencil     // Edition
CapUIIcon.Cross      // X
CapUIIcon.Check      // Validation
CapUIIcon.ArrowRight // Fleche droite
CapUIIcon.User       // Utilisateur
CapUIIcon.Cog        // Parametres
CapUIIcon.Search     // Recherche
```

### InfoMessage

```typescript
<InfoMessage
  variant="warning"           // info | warning | danger | success
  mt="sm"
>
  <InfoMessage.Title>
    {intl.formatMessage({ id: 'warning.title' })}
  </InfoMessage.Title>
  <InfoMessage.Content>
    {intl.formatMessage({ id: 'warning.content' })}
  </InfoMessage.Content>
</InfoMessage>
```

### Accordion

```typescript
<Accordion
  color={CapUIAccordionColor.Primary}
  allowMultiple                // Plusieurs sections ouvertes
  defaultAccordion={['section-1']}
>
  <Accordion.Item id="section-1">
    <Accordion.Button p={0}>
      <Text fontWeight={CapUIFontWeight.Semibold}>
        Section 1
      </Text>
    </Accordion.Button>
    <Accordion.Panel>
      Contenu de la section
    </Accordion.Panel>
  </Accordion.Item>
</Accordion>
```

## Patterns recommandes

### Conteneur de page

```typescript
<Box maxWidth="1200px" mx="auto" px={{ base: 'md', lg: 'xl' }} py="lg">
  {/* Contenu */}
</Box>
```

### Liste avec separateurs

```typescript
<Flex direction="column" gap={0}>
  {items.map((item, index) => (
    <Box
      key={item.id}
      py="md"
      borderBottomWidth={index < items.length - 1 ? '1px' : 0}
      borderColor="gray.200"
    >
      {item.name}
    </Box>
  ))}
</Flex>
```

### Formulaire vertical

```typescript
<Flex direction="column" gap={4} maxWidth="500px">
  <FormControl name="title" control={control} isRequired>
    <FormControl.Label>Titre</FormControl.Label>
    <FieldInput name="title" control={control} type="text" />
  </FormControl>

  <FormControl name="description" control={control}>
    <FormControl.Label>Description</FormControl.Label>
    <FieldInput name="description" control={control} type="textarea" />
  </FormControl>

  <Button type="submit" variant="primary" alignSelf="flex-end">
    Enregistrer
  </Button>
</Flex>
```

### Centrage vertical et horizontal

```typescript
<Flex
  height="100vh"
  align="center"
  justify="center"
>
  <Box>Contenu centre</Box>
</Flex>
```

## Bonnes pratiques

### A faire

1. **Tokens semantiques** : Utiliser `"md"`, `"lg"` plutot que des valeurs numeriques
2. **Props CapUI** : Privilegier les props directes (`p`, `m`, `bg`) avant `sx`
3. **Responsive mobile-first** : Commencer par `base` puis `md`, `lg`
4. **Composants CapUI** : Utiliser Button, Card, Modal au lieu de recreer
5. **Spacing coherent** : Utiliser les memes tokens dans tout le projet

### A eviter

1. **styled-components** : Ne pas utiliser, migrer vers CapUI
2. **CSS inline** : Eviter `style={{}}`, utiliser les props ou `sx`
3. **Valeurs magiques** : Pas de `padding: '17px'`, utiliser les tokens
4. **!important** : Jamais necessaire avec CapUI
5. **Classes CSS** : Eviter sauf pour integration externe (Leaflet, etc.)

## Migration depuis styled-components

```typescript
// AVANT (styled-components) - A NE PLUS FAIRE
const Container = styled.div`
  display: flex;
  padding: 16px;
  background: #f5f5f5;
  &:hover {
    background: #e0e0e0;
  }
`

// APRES (CapUI)
<Flex
  p="md"
  bg="gray.100"
  _hover={{ bg: 'gray.200' }}
>
  {/* contenu */}
</Flex>
```

## Exemples du projet

- Layout : [Layout.tsx](admin-next/components/BackOffice/Layout/Layout.tsx)
- Cards : [ProjectCard.tsx](admin-next/shared/projectCard/ProjectCard.tsx)
- Modal : [RegistrationModal.tsx](admin-next/shared/register/RegistrationModal.tsx)
- Formulaire : [ProjectConfigForm.tsx](admin-next/components/BackOffice/Projects/ProjectConfig/ProjectConfigForm.tsx)

## Checklist

- [ ] Pas de styled-components
- [ ] Tokens semantiques pour spacing (`"md"` pas `16`)
- [ ] Props responsive avec `base`, `md`, `lg`
- [ ] Couleurs du theme (`gray.500` pas `#999`)
- [ ] Composants CapUI (Button, Card, Modal...)
- [ ] `sx` uniquement pour styles non couverts par props
- [ ] Mobile-first (base = mobile)
