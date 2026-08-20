# Shared blocks

`overlay-band.hbs` is the common full-stage placement block. The scene module supplies a native
`bf-frame` inside a transparent 1080×1920 overlay wrapper. It is a placement wrapper, not a card
component.

`product-tile.hbs`, `offer-ticket.hbs`, and `progress-bar.hbs` are reusable UI fragments for
gallery, offer, and threshold compositions. They stay transparent, use only bold sans-serif
text, and leave product PNGs unboxed.

The wrapper deliberately has no background. A module may paint only its brand ribbon, metric chip,
translucent information box, product PNG, or thin rule while the source A-roll remains visible
across the full frame. Information boxes are 2/3 frame width and sit 200px above the bottom edge.
